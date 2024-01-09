import Joi from 'joi'
import { pathParams } from '../index.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, httpErrorsFor } from './github-helpers.js'

const schema = Joi.object({
  subscribers_count: nonNegativeInteger,
}).required()

export default class GithubWatchers extends GithubAuthV3Service {
  static category = 'social'

  static route = {
    base: 'github/watchers',
    pattern: ':user/:repo',
  }

  static openApi = {
    '/github/watchers/{user}/{repo}': {
      get: {
        summary: 'GitHub watchers',
        description: documentation,
        parameters: pathParams(
          { name: 'user', example: 'badges' },
          { name: 'repo', example: 'shields' },
        ),
      },
    },
  }

  static defaultBadgeData = {
    label: 'watchers',
    namedLogo: 'github',
  }

  static render({ watchers, user, repo }) {
    return {
      message: metric(watchers),
      style: 'social',
      color: 'blue',
      link: [
        `https://github.com/${user}/${repo}`,
        `https://github.com/${user}/${repo}/watchers`,
      ],
    }
  }

  async handle({ user, repo }) {
    const { subscribers_count: watchers } = await this._requestJson({
      url: `/repos/${user}/${repo}`,
      schema,
      httpErrors: httpErrorsFor(),
    })
    return this.constructor.render({ user, repo, watchers })
  }
}
