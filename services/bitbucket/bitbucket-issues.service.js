'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')
const { metric } = require('../../lib/text-formatters')
const { nonNegativeInteger } = require('../validators')

const bitbucketIssuesSchema = Joi.object({
  count: nonNegativeInteger,
}).required()

function issueClassGenerator(raw) {
  const routePrefix = raw ? 'issues-raw' : 'issues'
  const badgeSuffix = raw ? '' : ' open'

  return class BitbucketIssues extends BaseJsonService {
    async fetch({ user, repo }) {
      const url = `https://bitbucket.org/api/1.0/repositories/${user}/${repo}/issues/`
      return this._requestJson({
        url,
        schema: bitbucketIssuesSchema,
        options: {
          qs: { limit: 0, status: ['new', 'open'] },
          useQuerystring: true,
        },
        errorMessages: { 403: 'private repo' },
      })
    }

    static render({ issues }) {
      return {
        message: `${metric(issues)}${badgeSuffix}`,
        color: issues ? 'yellow' : 'brightgreen',
      }
    }

    async handle({ user, repo }) {
      const data = await this.fetch({ user, repo })
      return this.constructor.render({ issues: data.count })
    }

    static get category() {
      return 'issue-tracking'
    }

    static get defaultBadgeData() {
      return { label: 'issues' }
    }

    static get route() {
      return {
        base: `bitbucket/${routePrefix}`,
        format: '([^/]+)/([^/]+)',
        capture: ['user', 'repo'],
      }
    }

    static get examples() {
      return [
        {
          title: 'Bitbucket open issues',
          exampleUrl: 'atlassian/python-bitbucket',
          pattern: ':user/:repo',
          staticExample: this.render({ issues: 33 }),
        },
      ]
    }
  }
}

module.exports = [true, false].map(issueClassGenerator)
