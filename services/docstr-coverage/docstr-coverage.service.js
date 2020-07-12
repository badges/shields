'use strict'

const Joi = require('@hapi/joi')
const { GithubAuthV3Service } = require('../github/github-auth-service')
const url = require('url')
var yauzl = require("yauzl"); // for unzipping the artifact

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


async function downloadZip(buffer) {
  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(buffer, { lazyEntries: true }, function (err, zipfile) {
      if (err) reject(err)
      zipfile.readEntry()
      zipfile.on("entry", function (entry) {
        // directory entry
        if (/\/$/.test(entry.fileName)) {
          zipfile.readEntry()
        } else {
          // file entry
          if (entry.fileName !== "docstr-coverage.txt") zipfile.readEntry();
          zipfile.openReadStream(entry, function (err, readStream) {
            if (err) reject(err);
            let res;
            readStream.pipe(res);
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

  static render({ percentage }) {
    return {
      label: 'docstr-coverage',
      message: percentage,
      color: 'blue',
    }
  }

  // Github API test url: https://api.github.com/repos/fabiosangregorio/telereddit/actions/workflows/docs.yml/runs?branch=master&status=success
  // Local badge test url: http://localhost:8080/docstr-coverage/fabiosangregorio/telereddit/docs.yml/master
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
      url: url.URL(artifacts_url).path
    })

    if (!artifacts || artifacts.length === 0) return '-' // TODO: pretty print "no artifact in the run" error

    const artifactUrl = url.URL(artifacts[0].archive_download_url).path

    // Download the artifact
    // TODO: check artifact size before downloading
    const response = await this._request({ url: artifactUrl, options: { encoding: null } });
    const buffer = Buffer.from(response.res.body)
    // Download the artifact
    const report = await downloadZip(buffer);
    console.log(report);
    return 1;
  }

  async handle({ user, repo, workflow, branch }) {
    if (typeof branch === 'undefined') branch = 'master'

    const percentage = await this.fetch({ user, repo, workflow, branch })
    return this.constructor.render({ percentage })
  }
}
