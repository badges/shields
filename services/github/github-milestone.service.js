import Joi from 'joi'
import parseLinkHeader from 'parse-link-header'
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
    pattern: ':variant/:user/:repo',
  }

  static routeEnum = ['open', 'closed', 'all']

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

  static render({ variant, milestoneCount }) {
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
      message: metric(milestoneCount),
      color,
    }
  }

  async fetch({ user, repo, variant }) {
    // Request a single milestone per page, so that the number of the last
    // page in the Link header is the total number of milestones.
    const { res, buffer } = await this._request({
      url: `/repos/${user}/${repo}/milestones`,
      options: { searchParams: { state: variant, per_page: '1' } },
      httpErrors: httpErrorsFor('repo not found'),
    })

    const parsed = parseLinkHeader(res.headers.link)
    if (parsed && parsed.last) {
      return +parsed.last.page
    }

    const json = this._parseJson(buffer)
    const milestones = this.constructor._validate(json, schema)
    return milestones.length
  }

  async handle({ user, repo, variant }) {
    const milestoneCount = await this.fetch({ user, repo, variant })
    return this.constructor.render({ variant, milestoneCount })
  }
}
