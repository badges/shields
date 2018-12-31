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
    async fetchCloud({ args, user, repo }) {
      args.url = `https://bitbucket.org/api/2.0/repositories/${user}/${repo}/pullrequests/`
      args.options = { qs: { state: 'OPEN', limit: 0 } }

      if (
        serverSecrets &&
        serverSecrets.bitbucket_user &&
        serverSecrets.bitbucket_pass
      ) {
        args.options.auth = {
          user: serverSecrets.bitbucket_user,
          pass: serverSecrets.bitbucket_pass,
        }
      }

      return this._requestJson(args)
    }

    async fetchServer({ args, proto, hostAndPath, user, repo }) {
      args.url = `${proto}://${hostAndPath}/rest/api/1.0/projects/${user}/repos/${repo}/pull-requests`
      args.options = {
        qs: {
          state: 'OPEN',
          limit: 100,
          withProperties: false,
          withAttributes: false,
        },
      }

      if (
        serverSecrets &&
        serverSecrets.bitbucket_server_user &&
        serverSecrets.bitbucket_server_pass
      ) {
        args.options.auth = {
          user: serverSecrets.bitbucket_server_user,
          pass: serverSecrets.bitbucket_server_pass,
        }
      }

      return this._requestJson(args)
    }

    async fetch({ proto, hostAndPath, user, repo }) {
      const args = {
        schema: bitbucketPullRequestsSchema,
        errorMessages: {
          401: 'invalid credentials',
          403: 'private repo',
          404: 'not found',
        },
      }

      if (hostAndPath !== undefined) {
        return this.fetchServer({ args, proto, hostAndPath, user, repo })
      } else {
        return this.fetchCloud({ args, user, repo })
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
