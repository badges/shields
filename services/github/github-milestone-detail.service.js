import Joi from 'joi'
import { pathParams } from '../index.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, httpErrorsFor } from './github-helpers.js'

const schema = Joi.object({
  open_issues: nonNegativeInteger,
  closed_issues: nonNegativeInteger,
  title: Joi.string().required(),
}).required()

export default class GithubMilestoneDetail extends GithubAuthV3Service {
  static category = 'issue-tracking'
  static route = {
    base: 'github/milestones',
    pattern:
      ':variant(issues-closed|issues-open|issues-total|progress|progress-percent)/:user/:repo/:number([0-9]+)',
  }

  static openApi = {
    '/github/milestones/{variant}/{user}/{repo}/{number}': {
      get: {
        summary: 'GitHub milestone details',
        description: documentation,
        parameters: pathParams(
          {
            name: 'variant',
            example: 'issues-open',
            schema: { type: 'string', enum: this.getEnum('variant') },
          },
          {
            name: 'user',
            example: 'badges',
          },
          {
            name: 'repo',
            example: 'shields',
          },
          {
            name: 'number',
            example: '1',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'milestones', color: 'informational' }

  static render({ variant, milestone }) {
    let milestoneMetric
    let color
    let label = ''

    switch (variant) {
      case 'issues-open':
        milestoneMetric = milestone.open_issues
        color = 'red'
        label = 'open issues'
        break
      case 'issues-closed':
        milestoneMetric = milestone.closed_issues
        color = 'green'
        label = 'closed issues'
        break
      case 'issues-total':
        milestoneMetric = milestone.open_issues + milestone.closed_issues
        color = 'blue'
        label = 'issues'
        break
      case 'progress':
        milestoneMetric = `${milestone.closed_issues}/${
          milestone.open_issues + milestone.closed_issues
        }`
        color = 'blue'
        break
      case 'progress-percent':
        milestoneMetric = `${Math.floor(
          (milestone.closed_issues /
            (milestone.open_issues + milestone.closed_issues)) *
            100,
        )}%`
        color = 'blue'
    }

    return {
      label: `${milestone.title}${label ? ' ' : ''}${label}`,
      message: metric(milestoneMetric),
      color,
    }
  }

  async fetch({ user, repo, number }) {
    return this._requestJson({
      url: `/repos/${user}/${repo}/milestones/${number}`,
      schema,
      httpErrors: httpErrorsFor('repo or milestone not found'),
    })
  }

  async handle({ user, repo, variant, number }) {
    const milestone = await this.fetch({ user, repo, number })
    return this.constructor.render({ variant, milestone })
  }
}
