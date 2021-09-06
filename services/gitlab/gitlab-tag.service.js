import Joi from 'joi'
import { optionalUrl } from '../validators.js'
import { NotFound } from '../index.js'
import GitLabBase from './gitlab-base.js'

const schema = Joi.array().items(
  Joi.object({
    name: Joi.string().required(),
  })
)

const queryParamSchema = Joi.object({
  gitlab_url: optionalUrl,
}).required()

export default class GitlabTag extends GitLabBase {
  static category = 'version'

  static route = {
    base: 'gitlab/tag',
    pattern: ':user/:repo',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'GitLab tag (latest by date)',
      namedParams: {
        user: 'fdroid',
        repo: 'fdroidclient',
      },
      staticPreview: this.render({ name: '1.12.1' }),
    },
  ]

  static defaultBadgeData = { label: 'tag' }

  static render({ name }) {
    return {
      message: name,
      color: 'blue',
    }
  }

  async fetch({ user, repo, baseUrl }) {
    return super.fetch({
      schema,
      url: `${baseUrl}/api/v4/projects/${user}%2F${repo}/repository/tags`,
      errorMessages: {
        404: 'repo not found',
      },
    })
  }

  async handle({ user, repo }, { gitlab_url: baseUrl = 'https://gitlab.com' }) {
    const tags = await this.fetch({ user, repo, baseUrl })
    if (tags.length === 0)
      throw new NotFound({ prettyMessage: 'no tags found' })
    const { name } = tags[0]
    return this.constructor.render({ name })
  }
}
