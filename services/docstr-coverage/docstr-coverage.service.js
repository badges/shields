'use strict'

const Joi = require('@hapi/joi')
const { GithubAuthV3Service } = require('../github/github-auth-service')
const url = require('url')
var yauzl = require("yauzl"); // for unzipping the artifact

const colorRanges = [
  {
    percentage: 95,
    color: "brightgreen"
  }, {
    percentage: 90,
    color: "green"
  }, {
    percentage: 75,
    color: "yellowgreen"
  }, {
    percentage: 60,
    color: "yellow"
  }, {
    percentage: 40,
    color: "orange"
  }, {
    percentage: 0,
    color: "red"
  }
]

const artifactsListSchema = Joi.object({
  workflow_runs: Joi.array().items(
    Joi.object({ artifacts_url: Joi.string() })),
}).required()

const singleArtifactSchema = Joi.object({
  artifacts: Joi.array().items(
    Joi.object({
      name: Joi.string(), // TODO: filter artifact based on name
      archive_download_url: Joi.string()
    })),
}).required()


async function streamToString(stream) {
  const chunks = []
  return new Promise((resolve, reject) => {
    stream.on('data', chunk => chunks.push(chunk))
    stream.on('error', reject)
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
  })
}

async function downloadZip(buffer) {
  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(buffer, { lazyEntries: true }, function (err, zipfile) {
      if (err) reject(err)
      zipfile.readEntry()
      zipfile.on("entry", function (entry) {
        if (/\/$/.test(entry.fileName)) { // directory entry
          zipfile.readEntry()
        } else { // file entry
          if (entry.fileName !== "docstr-coverage.txt") zipfile.readEntry();
          zipfile.openReadStream(entry, async function (err, readStream) {
            if (err) reject(err);
            let res = await streamToString(readStream)
            resolve(res)
          })
        }
      })
    })
  })
}

module.exports = class DocstrCoverage extends GithubAuthV3Service {
  static get category() {
    return 'coverage'
  }

  static get route() {
    return {
      base: 'docstr-coverage',
      pattern: ':user/:repo/:workflow/:branch*',
    }
  }

  static get defaultBadgeData() {
    return { label: 'docstr-coverage' }
  }

  async handle({ user, repo, workflow, branch }) {
    if (typeof branch === 'undefined') branch = 'master'

    const percentage = await this.fetch({ user, repo, workflow, branch })
    return this.constructor.render({ percentage })
  }

  // Github API test url: https://api.github.com/repos/fabiosangregorio/telereddit/actions/workflows/docs.yml/runs?branch=master&status=success
  // Local badge test url: http://localhost:8080/docstr-coverage/fabiosangregorio/telereddit/docs.yml/master
  // TODO: camelCase everything
  // TODO: export to functions and improve readibility
  async fetch({ user, repo, workflow, branch }) {
    // Get artifacts list from latest Github Workflow run
    const { workflow_runs } = await this._requestJson({
      schema: artifactsListSchema,
      url: `repos/${user}/${repo}/actions/workflows/${workflow}/runs`,
      options: { qs: { branch, status: 'success' } },
    })

    if (!workflow_runs || workflow_runs.length === 0) return '-'
    const artifacts_url = workflow_runs[0].artifacts_url

    // Get single artifact download URL
    const { artifacts } = await this._requestJson({
      schema: singleArtifactSchema,
      url: url.parse(artifacts_url).path
    })

    if (!artifacts || artifacts.length === 0) return '-' // TODO: pretty print "no artifact in the run" error

    const artifactUrl = url.parse(artifacts[0].archive_download_url).path

    // Download the artifact
    // TODO: check artifact size before downloading
    const response = await this._request({ url: artifactUrl, options: { encoding: null } });
    const buffer = Buffer.from(response.res.body)
    // Download the artifact
    const report = await downloadZip(buffer)

    // Get coverage percentage from report
    // TODO: discuss with Hunter wether to have the report contain only the percentage or also everything else
    const lastLine = report.substr(report.lastIndexOf('\n', report.lastIndexOf('\n') - 1))
    const percentage = lastLine.match(/\d+(?:\.\d+)?/g)
    if (!percentage.length) return;
    return parseInt(percentage[0])
  }

  static render({ percentage }) {
    let badgeColor;
    for(let colorRange of colorRanges) {
      if(percentage > colorRange.percentage) {
        badgeColor = colorRange.color;
        break
      }
    }

    return {
      label: 'docstr-coverage', // TODO: discuss with Hunter badge's label
      message: `${percentage}%`,
      color: badgeColor,
    }
  }
}
