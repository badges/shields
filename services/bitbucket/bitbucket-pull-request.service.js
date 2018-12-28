'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')
const serverSecrets = require('../../lib/server-secrets')
const { metric } = require('../../lib/text-formatters')
const { nonNegativeInteger } = require('../validators')

const bitbucketPullRequestsSchema = Joi.object({
  size: nonNegativeInteger,
}).required()

function pullRequestClassGenerator(raw) {
  const routePrefix = raw ? 'pr-raw' : 'pr'
  const badgeSuffix = raw ? '' : ' open'

  return class BitbucketPullRequests extends BaseJsonService {
    async fetchCloud({ user, repo }) {
      const url = `https://bitbucket.org/api/2.0/repositories/${user}/${repo}/pullrequests/`
      return this._requestJson({
        url,
        schema: bitbucketPullRequestsSchema,
        options: { qs: { state: 'OPEN', limit: 0 } },
        errorMessages: { 403: 'private repo' },
      })
    }

    async fetchServer({ proto, hostAndPath, user, repo }) {
      const url = `${proto}://${hostAndPath}/rest/api/1.0/projects/${user}/repos/${repo}/pull-requests`
      const options = {
        qs: {
          state: 'OPEN',
          limit: 100,
          withProperties: false,
          withAttributes: false,
        },
      }

      if (
        serverSecrets &&
        serverSecrets.bitbucket_server_username &&
        serverSecrets.bitbucket_server_password
      ) {
        options.auth = {
          user: serverSecrets.bitbucket_server_username,
          pass: serverSecrets.bitbucket_server_password,
        }
      }

      return this._requestJson({
        url,
        schema: bitbucketPullRequestsSchema,
        options,
        errorMessages: {
          401: 'Authentication Required',
          403: 'Private Repo',
          404: 'Repo Not Found',
        },
      })
    }

    async fetch({ proto, hostAndPath, user, repo }) {
      if (proto !== undefined && hostAndPath !== undefined) {
        return this.fetchServer({ proto, hostAndPath, user, repo })
      } else {
        return this.fetchCloud({ user, repo })
      }
    }

    static render({ prs }) {
      return {
        message: `${metric(prs)}${badgeSuffix}`,
        color: prs ? 'yellow' : 'brightgreen',
      }
    }

    async handle({ proto, hostAndPath, user, repo }) {
      const data = await this.fetch({ proto, hostAndPath, user, repo })
      return this.constructor.render({ prs: data.size })
    }

    static get category() {
      return 'issue-tracking'
    }

    static get defaultBadgeData() {
      return { label: 'pull requests' }
    }

    static get route() {
      return {
        base: `bitbucket/${routePrefix}`,
        format: `(?:(http|https)/(.+)/)?([^/]+)/([^/]+)`,
        capture: ['proto', 'hostAndPath', 'user', 'repo'],
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
          pattern: ':user/:repo',
          staticExample: this.render({ prs: 22 }),
        },
        {
          title: 'Bitbucket Server open pull requests',
          namedParams: {
            proto: 'https',
            hostAndPath: 'bitbucket.mydomain.net',
            user: 'foo',
            repo: 'bar',
          },
          pattern: ':proto/:hostAndPath/:user/:repo',
          staticExample: this.render({ prs: 42 }),
        },
      ]
    }
  }
}

module.exports = [true, false].map(pullRequestClassGenerator)
