import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, errorMessagesFor } from './github-helpers.js'

const schema = Joi.object({
  subscribers_count: nonNegativeInteger,
}).required()

export default class GithubWatchers extends GithubAuthV3Service {
  static category = 'social'

  static route = {
    base: 'github/watchers',
    pattern: ':user/:repo',
  }

  static examples = [
    {
      title: 'GitHub watchers',
      namedParams: {
        user: 'badges',
        repo: 'shields',
      },
      // TODO: This is currently a literal, as `staticPreview` doesn't
      // support `link`.
      staticPreview: {
        label: 'Watch',
        message: '96',
        style: 'social',
      },
      queryParams: { label: 'Watch' },
      documentation,
    },
  ]

  static defaultBadgeData = {
    label: 'watchers',
    namedLogo: 'github',
  }

  static render({ watchers, user, repo }) {
    return {
      message: metric(watchers),
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
      errorMessages: errorMessagesFor(),
    })
    return this.constructor.render({ user, repo, watchers })
  }
}
