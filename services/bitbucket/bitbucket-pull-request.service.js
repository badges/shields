'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')
const { metric } = require('../../lib/text-formatters')
const { nonNegativeInteger } = require('../validators')

const bitbucketPullRequestsSchema = Joi.object({
  size: nonNegativeInteger,
}).required()

function pullRequestClassGenerator(raw) {
  const urlPrefix = raw ? 'pr-raw' : 'pr'
  const badgeSuffix = raw ? '' : ' open'

  return class BitbucketPullRequests extends BaseJsonService {
    async fetch({ user, repo }) {
      const url = `https://bitbucket.org/api/2.0/repositories/${user}/${repo}/pullrequests/`
      return this._requestJson({
        url,
        schema: bitbucketPullRequestsSchema,
        options: { qs: { state: 'OPEN', limit: 0 } },
        errorMessages: { 403: 'private repo' },
      })
    }

    static render({ prs }) {
      return {
        message: `${metric(prs)}${badgeSuffix}`,
        color: prs ? 'yellow' : 'brightgreen',
      }
    }

    async handle({ user, repo }) {
      const data = await this.fetch({ user, repo })
      return this.constructor.render({ prs: data.size })
    }

    static get category() {
      return 'issue-tracking'
    }

    static get defaultBadgeData() {
      return { label: 'pull requests' }
    }

    static get url() {
      return {
        base: `bitbucket/${urlPrefix}`,
        format: '([^/]+)/([^/]+)',
        capture: ['user', 'repo'],
      }
    }

    static get examples() {
      return [
        {
          title: 'Bitbucket open pull requests',
          exampleUrl: 'atlassian/python-bitbucket',
          urlPattern: ':user/:repo',
          staticExample: this.render({ prs: 22 }),
        },
      ]
    }
  }
}

module.exports = [true, false].map(pullRequestClassGenerator)
