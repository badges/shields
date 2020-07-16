'use strict'

const Joi = require('@hapi/joi')
const url = require('url')
// For unzipping the artifact
var yauzl = require("yauzl")
// Github JSON APIs
const { GithubAuthV3Service } = require('../github/github-auth-service')
// Handle badge errors
const { NotFound } = require('..')

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


/**
 * Read from a ReadStream and convert its content to String.
 * @param {ReadStream} stream The ReadStream from which to read
 */
async function streamToString(stream) {
  const chunks = []
  return new Promise((resolve, reject) => {
    stream.on('data', chunk => chunks.push(chunk))
    stream.on('error', reject)
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
  })
}

/**
 * Read contents from a zipped buffer, search for the coverage report and return
 * it as a string
 * @param {Buffer} buffer Buffer from which to read
 */
async function readZip(buffer) {
  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(buffer, { lazyEntries: true }, function (err, zipfile) {
      if (err) reject(err)
      zipfile.readEntry()
      zipfile.on("entry", function (entry) {
        if (/\/$/.test(entry.fileName)) {
          // directory entry
          zipfile.readEntry()
        } else {
          // file entry
          if (entry.fileName !== "docstr-coverage.txt") zipfile.readEntry()
          zipfile.openReadStream(entry, async function (err, readStream) {
            if (err) reject(err)
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
      pattern: ':user/:repo/:workflow/:branch?',
    }
  }

  static get defaultBadgeData() {
    return { label: 'docstr-coverage' }
  }

  async handle({ user, repo, workflow, branch }) {
    // Set master as the default branch
    if (typeof branch === 'undefined') branch = 'master'

    const percentage = await this.fetch({ user, repo, workflow, branch })
    return this.constructor.render({ percentage })
  }

  // TODO: remove these links
  // Github API test url: https://api.github.com/repos/fabiosangregorio/telereddit/actions/workflows/docs.yml/runs?branch=master&status=success
  // Local badge test url: http://localhost:8080/docstr-coverage/fabiosangregorio/telereddit/docs.yml/master
  /**
   * Fetch the percentage value from the docstring coverage using Github APIs.
   * The process works like this:
   *  - Get the artifacts list from the latest successful Github Workflow run
   *  - Get the single artifact download URL from last call
   *  - Download the zipped artifact and extract it
   *  - Read the percentage from the coverage report and return it
   * @param {String} user Github user
   * @param {String} repo Github repository 
   * @param {String} workflow Workflow file which generates the artifact
   * @param {String} branch Repository branch relative to the coverage report
   */
  async fetch({ user, repo, workflow, branch }) {
    // Get artifacts list from latest successful Github Workflow run
    let workflowRuns
    try {
      const { workflow_runs: runs } = await this._requestJson({
        schema: artifactsListSchema,
        url: `repos/${user}/${repo}/actions/workflows/${workflow}/runs`,
        options: { qs: { branch, status: 'success' } },
      })
      workflowRuns = runs
    } catch(e) {
      throw new NotFound({ prettyMessage: 'workflow not found' })
    }
    
    if (!workflowRuns || workflowRuns.length === 0) 
      throw new NotFound({ prettyMessage: 'branch not found' })
    const artifactsUrl = workflowRuns[0].artifacts_url

    // Get single artifact download URL
    const { artifacts } = await this._requestJson({
      schema: singleArtifactSchema,
      url: url.parse(artifactsUrl).path
    })
    if (!artifacts || artifacts.length === 0) 
      throw new NotFound({ prettyMessage: 'artifact not found' })
    const artifactUrl = url.parse(artifacts[0].archive_download_url).path

    // Download the artifact
    const response = await this._request({ url: artifactUrl, options: { encoding: null } })
    const report = await readZip(Buffer.from(response.res.body))

    // Get coverage percentage from report
    // TODO: discuss with Hunter wether to have the report contain only the percentage or also everything else
    const lastLine = report.substr(report.lastIndexOf('\n', report.lastIndexOf('\n') - 1))
    const percentage = lastLine.match(/\d+(?:\.\d+)?/g)
    if (!percentage.length) throw new NotFound({ prettyMessage: 'percentage not found' }) 

    return parseInt(percentage[0])
  }

  static render({ percentage }) {
    let badgeColor = 'lightgray'
    if(!isNaN(percentage)) {
      for(let colorRange of colorRanges) {
        if(percentage > colorRange.percentage) {
          badgeColor = colorRange.color
          percentage = `${percentage}%`
          break
        }
      }
    }
    
    return {
      label: 'docstr-coverage',
      message: percentage,
      color: badgeColor,
    }
  }

  static get examples() {
    return [
      { 
        title: "Docstring coverage (docstr-coverage)",
        namedParams: {
          user: 'fabiosangregorio',
          repo: 'telereddit',
          workflow: 'docs.yml',
          branch: 'master'
        },
        staticPreview: this.render({ percentage: 100 }),
        keywords: ['docstrings']
      }
    ]
  }
}
