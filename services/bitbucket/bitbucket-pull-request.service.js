'use strict'

const Joi = require('@hapi/joi')
const { AuthHelper } = require('../../core/base-service/auth-helper')
const { metric } = require('../text-formatters')
const { nonNegativeInteger, optionalUrl } = require('../validators')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  size: nonNegativeInteger,
}).required()

const queryParamSchema = Joi.object({
  server: optionalUrl,
}).required()

const errorMessages = {
  401: 'invalid credentials',
  403: 'private repo',
  404: 'not found',
}

function pullRequestClassGenerator(raw) {
  const routePrefix = raw ? 'pr-raw' : 'pr'
  const badgeSuffix = raw ? '' : ' open'

  return class BitbucketPullRequest extends BaseJsonService {
    static get name() {
      return `BitbucketPullRequest${raw ? 'Raw' : ''}`
    }

    static get category() {
      return 'issue-tracking'
    }

    static get route() {
      return {
        base: `bitbucket/${routePrefix}`,
        pattern: `:user/:repo`,
        queryParamSchema,
      }
    }

    static get examples() {
      return [
        {
          title: 'Bitbucket open pull requests',
          namedParams: {
            user: 'atlassian',
            repo: 'python-bitbucket',
          },
          staticPreview: this.render({ prs: 22 }),
        },
        {
          title: 'Bitbucket Server open pull requests',
          namedParams: {
            user: 'foo',
            repo: 'bar',
          },
          queryParams: { server: 'https://bitbucket.mydomain.net' },
          staticPreview: this.render({ prs: 42 }),
        },
      ]
    }

    static get defaultBadgeData() {
      return { label: 'pull requests' }
    }

    static render({ prs }) {
      return {
        message: `${metric(prs)}${badgeSuffix}`,
        color: prs ? 'yellow' : 'brightgreen',
      }
    }

    constructor(context, config) {
      super(context, config)

      this.bitbucketAuthHelper = new AuthHelper(
        {
          userKey: 'bitbucket_username',
          passKey: 'bitbucket_password',
        },
        config.private
      )
      this.bitbucketServerAuthHelper = new AuthHelper(
        {
          userKey: 'bitbucket_server_username',
          passKey: 'bitbucket_server_password',
        },
        config.private
      )
    }

    async fetchCloud({ user, repo }) {
      return this._requestJson({
        url: `https://bitbucket.org/api/2.0/repositories/${user}/${repo}/pullrequests/`,
        schema,
        options: {
          qs: { state: 'OPEN', limit: 0 },
          auth: this.bitbucketAuthHelper.basicAuth,
        },
        errorMessages,
      })
    }

    // https://docs.atlassian.com/bitbucket-server/rest/5.16.0/bitbucket-rest.html#idm46229602363312
    async fetchServer({ server, user, repo }) {
      return this._requestJson({
        url: `${server}/rest/api/1.0/projects/${user}/repos/${repo}/pull-requests`,
        schema,
        options: {
          qs: {
            state: 'OPEN',
            limit: 100,
            withProperties: false,
            withAttributes: false,
          },
          auth: this.bitbucketServerAuthHelper.basicAuth,
        },
        errorMessages,
      })
    }

    async fetch({ server, user, repo }) {
      if (server !== undefined) {
        return this.fetchServer({ server, user, repo })
      } else {
        return this.fetchCloud({ user, repo })
      }
    }

    async handle({ user, repo }, { server }) {
      const data = await this.fetch({ server, user, repo })
      return this.constructor.render({ prs: data.size })
    }
  }
}

module.exports = [true, false].map(pullRequestClassGenerator)
