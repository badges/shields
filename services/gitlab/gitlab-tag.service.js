'use strict'

const Joi = require('joi')
const { BaseJsonService, NotFound } = require('..')

const schema = Joi.array().items(
  Joi.object({
    name: Joi.string().required(),
  })
)

module.exports = class GitlabTag extends BaseJsonService {
  static category = 'version'

  static route = {
    base: 'gitlab/tag',
    pattern: ':user/:repo',
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

  async fetch({ user, repo }) {
    return this._requestJson({
      schema,
      url: `https://gitlab.com/api/v4/projects/${user}%2F${repo}/repository/tags`,
      errorMessages: {
        404: 'repo not found',
      },
    })
  }

  async handle({ user, repo }) {
    const tags = await this.fetch({ user, repo })
    if (tags.length === 0)
      throw new NotFound({ prettyMessage: 'no tags found' })
    const { name } = tags[0]
    return this.constructor.render({ name })
  }
}
