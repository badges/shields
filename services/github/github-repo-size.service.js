import Joi from 'joi'
import prettyBytes from 'pretty-bytes'
import { nonNegativeInteger } from '../validators.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, errorMessagesFor } from './github-helpers.js'

const schema = Joi.object({
  size: nonNegativeInteger,
}).required()

export default class GithubRepoSize extends GithubAuthV3Service {
  static category = 'size'
  static route = { base: 'github/repo-size', pattern: ':user/:repo' }
  static examples = [
    {
      title: 'GitHub repo size',
      namedParams: {
        user: 'atom',
        repo: 'atom',
      },
      staticPreview: this.render({ size: 319488 }),
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'repo size' }

  static render({ size }) {
    return {
      // note the GH API returns size in Kb
      message: prettyBytes(size * 1024),
      color: 'blue',
    }
  }

  async fetch({ user, repo }) {
    return this._requestJson({
      url: `/repos/${user}/${repo}`,
      schema,
      errorMessages: errorMessagesFor(),
    })
  }

  async handle({ user, repo }) {
    const { size } = await this.fetch({ user, repo })
    return this.constructor.render({ size })
  }
}
