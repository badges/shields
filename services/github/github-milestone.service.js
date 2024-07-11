import Joi from 'joi'
import { pathParams } from '../index.js'
import { metric } from '../text-formatters.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, httpErrorsFor } from './github-helpers.js'

const schema = Joi.array()
  .items(
    Joi.object({
      state: Joi.string().required(),
    }),
  )
  .required()

export default class GithubMilestone extends GithubAuthV3Service {
  static category = 'issue-tracking'
  static route = {
    base: 'github/milestones',
    pattern: ':variant(open|closed|all)/:user/:repo',
  }

  static openApi = {
    '/github/milestones/{variant}/{user}/{repo}': {
      get: {
        summary: 'GitHub number of milestones',
        description: documentation,
        parameters: pathParams(
          {
            name: 'variant',
            example: 'open',
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
        ),
      },
    },
  }

  static defaultBadgeData = {
    label: 'milestones',
    color: 'informational',
  }

  static render({ variant, milestones }) {
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
      httpErrors: httpErrorsFor('repo not found'),
    })
  }

  async handle({ user, repo, variant }) {
    const milestones = await this.fetch({ user, repo, variant })
    return this.constructor.render({ variant, milestones })
  }
}
