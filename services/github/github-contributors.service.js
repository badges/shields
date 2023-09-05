import Joi from 'joi'
import parseLinkHeader from 'parse-link-header'
import { pathParams } from '../index.js'
import { renderContributorBadge } from '../contributor-count.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, httpErrorsFor } from './github-helpers.js'

// All we do is check its length.
const schema = Joi.array().items(Joi.object())

export default class GithubContributors extends GithubAuthV3Service {
  static category = 'activity'
  static route = {
    base: 'github',
    pattern: ':variant(contributors|contributors-anon)/:user/:repo',
  }

  static openApi = {
    '/github/{variant}/{user}/{repo}': {
      get: {
        summary: 'GitHub contributors',
        description: documentation,
        parameters: pathParams(
          {
            name: 'variant',
            example: 'contributors',
            schema: { type: 'string', enum: this.getEnum('variant') },
          },
          {
            name: 'user',
            example: 'cdnjs',
          },
          {
            name: 'repo',
            example: 'cdnjs',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'contributors' }

  static render({ contributorCount }) {
    return renderContributorBadge({ contributorCount })
  }

  async handle({ variant, user, repo }) {
    const isAnon = variant === 'contributors-anon'

    const { res, buffer } = await this._request({
      url: `/repos/${user}/${repo}/contributors`,
      options: { searchParams: { page: '1', per_page: '1', anon: isAnon } },
      httpErrors: httpErrorsFor('repo not found'),
    })

    const parsed = parseLinkHeader(res.headers.link)
    let contributorCount
    if (parsed === null) {
      const json = this._parseJson(buffer)
      const contributorInfo = this.constructor._validate(json, schema)
      contributorCount = contributorInfo.length
    } else {
      contributorCount = +parsed.last.page
    }

    return this.constructor.render({ contributorCount })
  }
}
