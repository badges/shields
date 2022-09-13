import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, errorMessagesFor } from './github-helpers.js'

const schema = Joi.array()
  .items(
    Joi.object({
      state: Joi.string().required(),
    })
  )
  .required()

export default class GithubMilestone extends GithubAuthV3Service {
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
    let qualifier = ''

    switch (variant) {
      case 'all':
        color = 'blue'
        break
      case 'open':
        color = 'red'
        qualifier = 'active'
        break
      case 'closed':
        color = 'green'
        qualifier = 'completed'
        break
    }

    return {
      label: `${qualifier}${qualifier ? ' ' : ''}milestones`,
      message: metric(milestoneLength),
      color,
    }
  }

  async fetch({ user, repo, variant }) {
    return this._requestJson({
      url: `/repos/${user}/${repo}/milestones?state=${variant}`,
      schema,
      errorMessages: errorMessagesFor('repo not found'),
    })
  }

  async handle({ user, repo, variant }) {
    const milestones = await this.fetch({ user, repo, variant })
    return this.constructor.render({ user, repo, variant, milestones })
  }
}
