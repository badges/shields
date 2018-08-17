'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')

const werckerSchema = Joi.array()
  .items(
    Joi.object({
      status: Joi.string().required(),
      result: Joi.string().required(),
    })
  )
  .min(1)
  .required()

module.exports = class Wercker extends BaseJsonService {
  async fetch({ applicationName, projectId, branch }) {
    const url = applicationName
      ? `https://app.wercker.com/api/v3/applications/${applicationName}/builds?limit=1`
      : `https://app.wercker.com/getbuilds/${projectId}?limit=1`
    return this._requestJson({
      schema: werckerSchema,
      url,
      options: { qs: { branch } },
      errorMessages: {
        401: 'private application not supported',
        404: 'application not found',
      },
    })
  }

  static render({ status, result }) {
    if (status === 'finished') {
      if (result === 'passed') {
        return { message: 'passing', color: 'brightgreen' }
      } else {
        return { message: result, color: 'red' }
      }
    }
    return { message: status }
  }

  async handle({ applicationName, projectId, branch }) {
    const json = await this.fetch({ applicationName, projectId, branch })
    const { status, result } = json[0]
    return this.constructor.render({ status, result })
  }

  // Metadata
  static get category() {
    return 'build'
  }

  static get url() {
    return {
      base: 'wercker/ci',
      format: '(?:([^/]+/[^/]+)|([a-fA-F0-9]+))(?:/(.+))?',
      capture: ['applicationName', 'projectId', 'branch'],
    }
  }

  static get examples() {
    return [
      {
        previewUrl: 'wercker/go-wercker-api',
      },
      {
        title: `${this.name} branch`,
        previewUrl: 'wercker/go-wercker-api/master',
      },
    ]
  }
}
