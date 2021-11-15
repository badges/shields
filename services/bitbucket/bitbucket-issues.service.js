import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'

const bitbucketIssuesSchema = Joi.object({
  size: nonNegativeInteger,
}).required()

function issueClassGenerator(raw) {
  const routePrefix = raw ? 'issues-raw' : 'issues'
  const badgeSuffix = raw ? '' : ' open'

  return class BitbucketIssues extends BaseJsonService {
    static name = `BitbucketIssues${raw ? 'Raw' : ''}`
    static category = 'issue-tracking'
    static route = { base: `bitbucket/${routePrefix}`, pattern: ':user/:repo' }

    static examples = [
      {
        title: 'Bitbucket open issues',
        namedParams: {
          user: 'atlassian',
          repo: 'python-bitbucket',
        },
        staticPreview: this.render({ issues: 33 }),
      },
    ]

    static defaultBadgeData = { label: 'issues' }

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
          searchParams: { limit: 0, q: '(state = "new" OR state = "open")' },
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

export const BitbucketRawIssues = issueClassGenerator(true)
export const BitbucketNonRawIssues = issueClassGenerator(false)
