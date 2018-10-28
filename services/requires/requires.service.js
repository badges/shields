'use strict'

const BaseJsonService = require('../base-json')
const Joi = require('joi')

const statusSchema = Joi.object({
  status: Joi.string().required(),
}).required()

module.exports = class RequiresIo extends BaseJsonService {
  static get url() {
    return {
      base: 'requires',
      format: '([^/]+/[^/]+/[^/]+)(?:/(.+))?',
      capture: ['repo', 'branch'],
    }
  }

  static get defaultBadgeData() {
    return { label: 'requirements' }
  }

  async handle({ repo, branch }) {
    const { status: statusRaw } = await this.fetch({ repo, branch })
    let status = statusRaw
    let color = 'lightgrey'
    if (status === 'up-to-date') {
      status = 'up to date'
      color = 'brightgreen'
    } else if (status === 'outdated') {
      color = 'yellow'
    } else if (status === 'insecure') {
      color = 'red'
    }

    return this.constructor.render({ status, color })
  }

  async fetch({ repo, branch }) {
    const url = `https://requires.io/api/v1/status/${repo}`
    return this._requestJson({
      url,
      schema: statusSchema,
      options: { qs: { branch: branch } },
    })
  }

  static render({ status, color }) {
    return { message: status, color: color }
  }

  static get category() {
    return 'dependencies'
  }

  static get examples() {
    return [
      {
        title: 'Requires.io',
        urlPattern: ':service/:user/:repo',
        staticExample: this.render({
          status: 'up to date',
          color: 'brightgreen',
        }),
        exampleUrl: 'github/celery/celery',
        keywords: ['requires'],
      },
    ]
  }
}
