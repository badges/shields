'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')

const messageRegex = /passed|passed .* new defects|pending|failed/
const schema = Joi.object({
  message: Joi.string()
    .regex(messageRegex)
    .required(),
}).required()

module.exports = class CoverityScan extends BaseJsonService {
  static render({ message }) {
    let color
    if (message === 'passed') {
      color = 'brightgreen'
      message = 'passing'
    } else if (/^passed .* new defects$/.test(message)) {
      color = 'yellow'
    } else if (message === 'pending') {
      color = 'orange'
    } else {
      color = 'red'
    }

    return {
      message,
      color,
    }
  }

  static get category() {
    return 'quality'
  }

  static get defaultBadgeData() {
    return {
      label: 'coverity',
    }
  }

  static get route() {
    return {
      base: 'coverity/scan',
      pattern: ':projectId',
    }
  }

  static get examples() {
    return [
      {
        title: 'Coverity Scan',
        pattern: ':projectId',
        namedParams: {
          projectId: '3997',
        },
        staticPreview: this.render({
          message: 'passed',
        }),
      },
    ]
  }

  async handle({ projectId }) {
    const url = `https://scan.coverity.com/projects/${projectId}/badge.json`
    const json = await this._requestJson({
      url,
      schema,
      errorMessages: {
        // At the moment Coverity returns an HTTP 200 with an HTML page
        // displaying the text 404 when project is not found.
        404: 'project not found',
      },
    })
    return this.constructor.render({ message: json.message })
  }
}
