'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')

const projectsCountRegex = /^\s[0-9]*(\.[0-9]k)?\sprojects$/
const schema = Joi.object({
  value: Joi.string()
    .regex(projectsCountRegex)
    .required(),
}).required()

module.exports = class Sourcegraph extends BaseJsonService {
  static render({ projectsCount }) {
    return {
      message: projectsCount,
    }
  }
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'sourcegraph/rrc',
      pattern: ':repo(.*)',
    }
  }

  static get defaultBadgeData() {
    return { color: 'brightgreen', label: 'used by' }
  }

  static get examples() {
    return [
      {
        title: 'Sourcegraph for Repo Reference Count',
        pattern: ':repo',
        namedParams: {
          repo: 'github.com/gorilla/mux',
        },
        staticPreview: this.render({ projectsCount: '9.9k projects' }),
      },
    ]
  }

  async handle({ repo }) {
    const url = `https://sourcegraph.com/.api/repos/${repo}/-/shield`
    const json = await this._requestJson({
      url,
      schema,
    })
    return this.constructor.render({ projectsCount: json.value.trim() })
  }
}
