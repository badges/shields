'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')

const bitbucketPipelinesSchema = Joi.object({
  values: Joi.array()
    .items(
      Joi.object({
        state: Joi.object({
          name: Joi.string().required(),
          result: Joi.object({
            name: Joi.string().required(),
          }).required(),
        }).required(),
      })
    )
    .required(),
}).required()

module.exports = class BitbucketPipelines extends BaseJsonService {
  async fetch({ user, repo, branch }) {
    const url = `https://api.bitbucket.org/2.0/repositories/${user}/${repo}/pipelines/`
    return this._requestJson({
      url,
      schema: bitbucketPipelinesSchema,
      options: {
        qs: {
          fields: 'values.state',
          page: 1,
          pagelen: 2,
          sort: '-created_on',
          'target.ref_type': 'BRANCH',
          'target.ref_name': branch,
        },
      },
      errorMessages: { 403: 'private repo' },
    })
  }

  static render({ status }) {
    const responses = {
      SUCCESSFUL: { message: 'passing', color: 'brightgreen' },
      FAILED: { message: 'failing', color: 'red' },
      ERROR: { message: 'error', color: 'red' },
      STOPPED: { message: 'stopped', color: 'yellow' },
      EXPIRED: { message: 'expired', color: 'yellow' },
      'never built': { message: 'never built', color: 'lightgrey' },
    }
    if (Object.keys(responses).includes(status)) {
      return responses[status]
    }
    return { message: 'unknown', color: 'lightgrey' }
  }

  static transform(data) {
    const values = data.values.filter(
      value => value.state && value.state.name === 'COMPLETED'
    )
    if (values.length > 0) {
      return values[0].state.result.name
    }
    return 'never built'
  }

  async handle({ user, repo, branch }) {
    const data = await this.fetch({ user, repo, branch: branch || 'master' })
    return this.constructor.render({ status: this.constructor.transform(data) })
  }

  static get category() {
    return 'build'
  }

  static get defaultBadgeData() {
    return { label: 'build' }
  }

  static get route() {
    return {
      base: 'bitbucket/pipelines',
      format: '([^/]+)/([^/]+)(?:/(.+))?',
      capture: ['user', 'repo', 'branch'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Bitbucket Pipelines',
        exampleUrl: 'atlassian/adf-builder-javascript',
        pattern: ':user/:repo',
        staticExample: this.render({ status: 'SUCCESSFUL' }),
      },
      {
        title: 'Bitbucket Pipelines branch',
        exampleUrl: 'atlassian/adf-builder-javascript/task/SECO-2168',
        pattern: ':user/:repo/:branch',
        staticExample: this.render({ status: 'SUCCESSFUL' }),
      },
    ]
  }
}
