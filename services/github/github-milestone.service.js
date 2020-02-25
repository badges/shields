'use strict'

const Joi = require('@hapi/joi')
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
  static get category() {
    return 'issue-tracking'
  }

  static get route() {
    return {
      base: 'github/milestones',
      pattern: ':variant(open|closed|all)/:user/:repo',
    }
  }

  static get examples() {
    return [
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
  }

  static get defaultBadgeData() {
    return {
      label: 'milestones',
      color: 'informational',
    }
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
