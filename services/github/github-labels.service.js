import Joi from 'joi'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, errorMessagesFor } from './github-helpers.js'

const schema = Joi.object({
  color: Joi.string().hex().required(),
}).required()

export default class GithubLabels extends GithubAuthV3Service {
  static category = 'issue-tracking'
  static route = { base: 'github/labels', pattern: ':user/:repo/:name' }
  static examples = [
    {
      title: 'GitHub labels',
      namedParams: {
        user: 'atom',
        repo: 'atom',
        name: 'help-wanted',
      },
      staticPreview: this.render({ name: 'help-wanted', color: '#159818' }),
      documentation,
    },
  ]

  static defaultBadgeData = { label: ' ' }

  static render({ name, color }) {
    return {
      message: name,
      color,
    }
  }

  async fetch({ user, repo, name }) {
    return this._requestJson({
      url: `/repos/${user}/${repo}/labels/${name}`,
      schema,
      errorMessages: errorMessagesFor(`repo or label not found`),
    })
  }

  async handle({ user, repo, name }) {
    const { color } = await this.fetch({ user, repo, name })
    return this.constructor.render({ name, color })
  }
}
