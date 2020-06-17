'use strict'

const Joi = require('@hapi/joi')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  workflow_runs: Joi.array().items(
    Joi.object({
      artifacts_url: Joi.string(),
    })
  ),
}).required()

module.exports = class Example extends BaseJsonService {
  static get category() {
    return 'coverage'
  }

  // https://api.github.com/repos/fabiosangregorio/telereddit/actions/workflows/docs.yml/runs?branch=master&status=success

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

  async fetch({ user, repo, workflow, branch }) {
    const { workflow_runs } = await this._requestJson({
      schema,
      url: `https://api.github.com/repos/${user}/${repo}/actions/workflows/${workflow}/runs`,
      options: {
        qs: {
          branch,
          status: 'success',
        },
      },
    })

    if (!workflow_runs || workflow_runs.length === 0) return '-'
    const artifact_url = workflow_runs[0].artifacts_url

    const https = require('https')
    const fs = require('fs')

    const file = fs.createWriteStream('./file.zip')
    await https.get(
      artifact_url,
      {
        headers: { 'User-Agent': 'docst-coverage' },
      },
      function (response) {
        response.pipe(file)
      }
    )
  }

  async handle({ user, repo, workflow, branch }) {
    if (typeof branch === 'undefined') branch = 'master'

    const percentage = await this.fetch({ user, repo, workflow, branch })
    return this.constructor.render({ percentage })
  }
}
