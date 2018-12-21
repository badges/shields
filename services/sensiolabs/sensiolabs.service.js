'use strict'

const Joi = require('joi')
const BaseXmlService = require('../base-xml')
const serverSecrets = require('../../lib/server-secrets')
const { statusRegex } = require('./sensiolabs-helpers')

const schema = Joi.object({
  project: Joi.object({
    'last-analysis': Joi.object({
      status: Joi.string()
        .regex(statusRegex)
        .required(),
      grade: Joi.string()
        .regex(/platinum|gold|silver|bronze|none/)
        .allow('', null),
    }),
  }).required(),
}).required()

module.exports = class Sensiolabs extends BaseXmlService {
  static render({ status, grade }) {
    if (status !== 'finished') {
      return {
        message: 'pending',
        color: 'grey',
      }
    }
    let color,
      message = grade
    if (grade === 'platinum') {
      color = 'brightgreen'
    } else if (grade === 'gold') {
      color = 'yellow'
    } else if (grade === 'silver') {
      color = 'lightgrey'
    } else if (grade === 'bronze') {
      color = 'orange'
    } else {
      message = 'no medal'
      color = 'red'
    }

    return {
      message,
      color,
    }
  }

  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'sensiolabs/i',
      pattern: ':projectUuid',
    }
  }

  static get defaultBadgeData() {
    return {
      label: 'check',
    }
  }

  static get examples() {
    return [
      {
        title: 'SensioLabs Insight',
        pattern: ':projectUuid',
        namedParams: {
          projectUuid: '45afb680-d4e6-4e66-93ea-bcfa79eb8a87',
        },
        staticPreview: this.render({
          status: 'finished',
          grade: 'bronze',
        }),
      },
    ]
  }

  async fetch({ projectUuid }) {
    const url = `https://insight.sensiolabs.com/api/projects/${projectUuid}`
    const options = {
      headers: {
        Accept: 'application/vnd.com.sensiolabs.insight+xml',
      },
    }

    if (serverSecrets && serverSecrets.sl_insight_userUuid) {
      options.auth = {
        user: serverSecrets.sl_insight_userUuid,
        pass: serverSecrets.sl_insight_apiToken,
      }
    }

    return this._requestXml({
      url,
      options,
      schema,
      errorMessages: {
        401: 'not authorized to access project',
        404: 'project not found',
      },
    })
  }

  transform({ data }) {
    const lastAnalysis = data.project['last-analysis']
    return { status: lastAnalysis.status, grade: lastAnalysis.grade }
  }

  async handle({ projectUuid }) {
    const data = await this.fetch({ projectUuid })
    const { status, grade } = this.transform({ data })
    return this.constructor.render({ status, grade })
  }
}
