import Joi from 'joi'
import { pathParams } from '../index.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, httpErrorsFor } from './github-helpers.js'

const schema = Joi.object({
  stargazers_count: nonNegativeInteger,
}).required()

export default class GithubStars extends GithubAuthV3Service {
  static category = 'social'

  static route = {
    base: 'github/stars',
    pattern: ':user/:repo',
  }

  static openApi = {
    '/github/stars/{user}/{repo}': {
      get: {
        summary: 'GitHub Repo stars',
        description: documentation,
        parameters: pathParams(
          { name: 'user', example: 'badges' },
          { name: 'repo', example: 'shields' },
        ),
      },
    },
  }

  static defaultBadgeData = {
    label: 'stars',
    namedLogo: 'github',
  }

  static render({ stars, user, repo }) {
    const slug = `${encodeURIComponent(user)}/${encodeURIComponent(repo)}`
    return {
      message: metric(stars),
      style: 'social',
      color: 'blue',
      link: [
        `https://github.com/${slug}`,
        `https://github.com/${slug}/stargazers`,
      ],
    }
  }

  async handle({ user, repo }) {
    const { stargazers_count: stars } = await this._requestJson({
      url: `/repos/${user}/${repo}`,
      schema,
      httpErrors: httpErrorsFor(),
    })
    return this.constructor.render({ user, repo, stars })
  }
}
