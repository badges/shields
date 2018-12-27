'use strict'

const BaseJsonService = require('../base-json')
const serverSecrets = require('../../lib/server-secrets')

const Joi = require('joi')
const schema = Joi.object({
  size: Joi.number()
    .integer()
    .min(0)
    .required(),
}).required()

module.exports = class BitbucketServer extends BaseJsonService {
  static get category() {
    return 'build'
  }

  static get defaultBadgeData() {
    return {
      label: 'Open Pull Requests',
    }
  }

  static get examples() {
    return [
      {
        title: 'Bitbucket Server: Open Pull Requests',
        namedParams: {
          proto: 'https',
          host: 'bitbucket.mydomain.net',
          project: 'foo',
          repo: 'bar',
        },
        staticExample: this.render({ count: 7 }),
        keywords: ['bitbucket', 'pull-request'],
      },
    ]
  }

  static get route() {
    return {
      base: 'bitbucket-server',
      pattern: ':proto/:host/:project/:repo/pr',
    }
  }

  static render({ count }) {
    return {
      message: count.toString(),
      color: 'brightgreen',
    }
  }

  async fetch({ proto, host, project, repo }) {
    let authenticatedHost = host
    if (
      serverSecrets &&
      serverSecrets.bitbucket_server_username &&
      serverSecrets.bitbucket_server_password
    ) {
      authenticatedHost = `${serverSecrets.bitbucket_server_username}:${
        serverSecrets.bitbucket_server_password
      }@${host}`
    }

    return this._requestJson({
      schema,
      url: `${proto}://${authenticatedHost}/rest/api/1.0/projects/${project}/repos/${repo}/pull-requests?limit=100&state=OPEN&wthProperties=false&withAttributes=false`,
    })
  }

  async handle({ proto, host, project, repo }) {
    const { size } = await this.fetch({ proto, host, project, repo })
    return this.constructor.render({ count: size })
  }
}
