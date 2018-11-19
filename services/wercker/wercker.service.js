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
  .min(0)
  .max(1)
  .required()

module.exports = class Wercker extends BaseJsonService {
  static getBaseUrl({ projectId, applicationName }) {
    if (applicationName) {
      return `https://app.wercker.com/api/v3/applications/${applicationName}/builds`
    } else {
      return `https://app.wercker.com/api/v3/runs?applicationId=${projectId}`
    }
  }

  async fetch({ baseUrl, branch }) {
    return this._requestJson({
      schema: werckerSchema,
      url: baseUrl,
      options: {
        qs: {
          branch,
          limit: 1,
        },
      },
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

  async handle({ projectId, applicationName, branch }) {
    const json = await this.fetch({
      baseUrl: this.constructor.getBaseUrl({
        projectId,
        applicationName,
      }),
      branch,
    })
    if (json.length === 0) {
      return this.constructor.render({
        status: 'finished',
        result: 'no builds',
      })
    }
    const { status, result } = json[0]
    return this.constructor.render({ status, result })
  }

  // Metadata
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'wercker',
      format:
        '(?:(?:ci/)([a-fA-F0-9]{24})|(?:build|ci)/([^/]+/[^/]+))(?:/(.+))?',
      capture: ['projectId', 'applicationName', 'branch'],
    }
  }

  static get examples() {
    return [
      {
        title: `Wercker CI Run`,
        exampleUrl: 'ci/559e33c8e982fc615500b357',
        pattern: 'ci/:applicationId',
        staticExample: this.render({ status: 'finished', result: 'passed' }),
      },
      {
        title: `Wercker CI Run`,
        exampleUrl: 'ci/559e33c8e982fc615500b357/master',
        pattern: 'ci/:applicationId/:branch',
        staticExample: this.render({ status: 'finished', result: 'passed' }),
      },
      {
        title: `Wercker Build`,
        exampleUrl: 'build/wercker/go-wercker-api',
        pattern: 'build/:userName/:applicationName',
        staticExample: this.render({ status: 'finished', result: 'passed' }),
      },
      {
        title: `Wercker Build branch`,
        exampleUrl: 'build/wercker/go-wercker-api/master',
        pattern: 'build/:userName/:applicationName/:branch',
        staticExample: this.render({ status: 'finished', result: 'passed' }),
      },
    ]
  }
}
