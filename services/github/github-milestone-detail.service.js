'use strict'

const Joi = require('joi')
const { metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')
const { GithubAuthV3Service } = require('./github-auth-service')
const { documentation, errorMessagesFor } = require('./github-helpers')

const schema = Joi.object({
  open_issues: nonNegativeInteger,
  closed_issues: nonNegativeInteger,
  title: Joi.string().required(),
}).required()

module.exports = class GithubMilestoneDetail extends GithubAuthV3Service {
  static category = 'issue-tracking'
  static route = {
    base: 'github/milestones',
    pattern:
      ':variant(issues-closed|issues-open|issues-total|progress|progress-percent)/:user/:repo/:number([0-9]+)',
  }

  static examples = [
    {
      title: 'GitHub milestone',
      namedParams: {
        variant: 'issues-open',
        user: 'badges',
        repo: 'shields',
        number: '1',
      },
      staticPreview: {
        label: 'milestone issues',
        message: '17/22',
        color: 'blue',
      },
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'milestones', color: 'informational' }

  static render({ user, repo, variant, number, milestone }) {
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
            100
        )}%`
        color = 'blue'
    }

    return {
      label: `${milestone.title} ${label}`,
      message: metric(milestoneMetric),
      color,
      link: [`https://github.com/${user}/${repo}/milestone/${number}`],
    }
  }

  async fetch({ user, repo, number }) {
    return this._requestJson({
      url: `/repos/${user}/${repo}/milestones/${number}`,
      schema,
      errorMessages: errorMessagesFor(`repo or milestone not found`),
    })
  }

  async handle({ user, repo, variant, number }) {
    const milestone = await this.fetch({ user, repo, number })
    return this.constructor.render({ user, repo, variant, number, milestone })
  }
}
