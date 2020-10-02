'use strict'

const Joi = require('joi')
const { metric } = require('../text-formatters')
const { GithubAuthV3Service } = require('./github-auth-service')
const { documentation, errorMessagesFor } = require('./github-helpers')

const schema = Joi.array()
  .items(
    Joi.object({
      state: Joi.string().required(),
    })
  )
  .required()

module.exports = class GithubMilestone extends GithubAuthV3Service {
  static category = 'issue-tracking'
  static route = {
    base: 'github/milestones',
    pattern: ':variant(open|closed|all)/:user/:repo',
  }

  static examples = [
    {
      title: 'GitHub milestones',
      namedParams: {
        user: 'badges',
        repo: 'shields',
        variant: 'open',
      },
      staticPreview: {
        label: 'milestones',
        message: '2',
        color: 'red',
      },
      documentation,
    },
  ]

  static defaultBadgeData = {
    label: 'milestones',
    color: 'informational',
  }

  static render({ user, repo, variant, milestones }) {
    const milestoneLength = milestones.length
    let color
    let label = ''

    switch (variant) {
      case 'all':
        color = 'blue'
        break
      case 'open':
        color = 'red'
        label = 'active'
        break
      case 'closed':
        color = 'green'
        label = 'completed'
        break
    }

    return {
      label: `${label} milestones`,
      message: metric(milestoneLength),
      color,
      link: [`https://github.com/${user}/${repo}/milestones`],
    }
  }

  async fetch({ user, repo, variant }) {
    return this._requestJson({
      url: `/repos/${user}/${repo}/milestones?state=${variant}`,
      schema,
      errorMessages: errorMessagesFor(`repo not found`),
    })
  }

  async handle({ user, repo, variant }) {
    const milestones = await this.fetch({ user, repo, variant })
    return this.constructor.render({ user, repo, variant, milestones })
  }
}
