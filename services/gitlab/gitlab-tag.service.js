'use strict'

const Joi = require('joi')
const { BaseJsonService } = require('..')

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
    })
  }

  async handle({ user, repo }) {
    const json = await this.fetch({ user, repo })
    const { name } = json[0]
    return this.constructor.render({ name })
  }
}
