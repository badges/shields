'use strict'

const Joi = require('@hapi/joi')
const { metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')
const { BaseJsonService } = require('..')

const bitbucketIssuesSchema = Joi.object({
  size: nonNegativeInteger,
}).required()

function issueClassGenerator(raw) {
  const routePrefix = raw ? 'issues-raw' : 'issues'
  const badgeSuffix = raw ? '' : ' open'

  return class BitbucketIssues extends BaseJsonService {
    static get name() {
      return `BitbucketIssues${raw ? 'Raw' : ''}`
    }

    static get category() {
      return 'issue-tracking'
    }

    static get route() {
      return {
        base: `bitbucket/${routePrefix}`,
        pattern: ':user/:repo',
      }
    }

    static get examples() {
      return [
        {
          title: 'Bitbucket open issues',
          namedParams: {
            user: 'atlassian',
            repo: 'python-bitbucket',
          },
          staticPreview: this.render({ issues: 33 }),
        },
      ]
    }

    static get defaultBadgeData() {
      return { label: 'issues' }
    }

    static render({ issues }) {
      return {
        message: `${metric(issues)}${badgeSuffix}`,
        color: issues ? 'yellow' : 'brightgreen',
      }
    }

    async fetch({ user, repo }) {
      // https://developer.atlassian.com/bitbucket/api/2/reference/resource/repositories/%7Busername%7D/%7Brepo_slug%7D/issues#get
      const url = `https://bitbucket.org/api/2.0/repositories/${user}/${repo}/issues/`
      return this._requestJson({
        url,
        schema: bitbucketIssuesSchema,
        // https://developer.atlassian.com/bitbucket/api/2/reference/meta/filtering#query-issues
        options: {
          qs: { limit: 0, q: '(state = "new" OR state = "open")' },
        },
        errorMessages: { 403: 'private repo' },
      })
    }

    async handle({ user, repo }) {
      const data = await this.fetch({ user, repo })
      return this.constructor.render({ issues: data.size })
    }
  }
}

module.exports = [true, false].map(issueClassGenerator)
