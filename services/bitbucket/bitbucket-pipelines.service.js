'use strict'

const Joi = require('@hapi/joi')
const { renderBuildStatusBadge } = require('../build-status')
const { BaseJsonService } = require('..')

const bitbucketPipelinesSchema = Joi.object({
  values: Joi.array()
    .items(
      Joi.object({
        state: Joi.object({
          name: Joi.string().required(),
          result: Joi.object({
            name: Joi.equal(
              'SUCCESSFUL',
              'FAILED',
              'ERROR',
              'STOPPED',
              'EXPIRED'
            ),
          }).required(),
        }).required(),
      })
    )
    .required(),
}).required()

module.exports = class BitbucketPipelines extends BaseJsonService {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'bitbucket/pipelines',
      pattern: ':user/:repo/:branch*',
    }
  }

  static get examples() {
    return [
      {
        title: 'Bitbucket Pipelines',
        pattern: ':user/:repo',
        namedParams: {
          user: 'atlassian',
          repo: 'adf-builder-javascript',
        },
        staticPreview: this.render({ status: 'SUCCESSFUL' }),
      },
      {
        title: 'Bitbucket Pipelines branch',
        pattern: ':user/:repo/:branch',
        namedParams: {
          user: 'atlassian',
          repo: 'adf-builder-javascript',
          branch: 'task/SECO-2168',
        },
        staticPreview: this.render({ status: 'SUCCESSFUL' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'build' }
  }

  static render({ status }) {
    return renderBuildStatusBadge({ status: status.toLowerCase() })
  }

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
}
