'use strict'

const Joi = require('@hapi/joi')
const { GithubAuthV3Service } = require('./github-auth-service')
const { documentation, errorMessagesFor } = require('./github-helpers')

const schema = Joi.object({
  color: Joi.string()
    .hex()
    .required(),
}).required()

module.exports = class GithubLabels extends GithubAuthV3Service {
  static get category() {
    return 'issue-tracking'
  }

  static get route() {
    return {
      base: 'github/labels',
      pattern: ':user/:repo/:name',
    }
  }

  static get examples() {
    return [
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
  }

  static get defaultBadgeData() {
    return {
      label: ' ',
    }
  }

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
