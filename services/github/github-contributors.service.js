import Joi from 'joi'
import parseLinkHeader from 'parse-link-header'
import { renderContributorBadge } from '../contributor-count.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, errorMessagesFor } from './github-helpers.js'

// All we do is check its length.
const schema = Joi.array().items(Joi.object())

export default class GithubContributors extends GithubAuthV3Service {
  static category = 'activity'
  static route = {
    base: 'github',
    pattern: ':variant(contributors|contributors-anon)/:user/:repo',
  }

  static examples = [
    {
      title: 'GitHub contributors',
      namedParams: {
        variant: 'contributors',
        user: 'cdnjs',
        repo: 'cdnjs',
      },
      staticPreview: this.render({ contributorCount: 397 }),
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'contributors' }

  static render({ contributorCount }) {
    return renderContributorBadge({ contributorCount })
  }

  async handle({ variant, user, repo }) {
    const isAnon = variant === 'contributors-anon'

    const { res, buffer } = await this._request({
      url: `/repos/${user}/${repo}/contributors`,
      options: { searchParams: { page: '1', per_page: '1', anon: isAnon } },
      errorMessages: errorMessagesFor('repo not found'),
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
