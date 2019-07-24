'use strict'

const Joi = require('@hapi/joi')
const { isBuildStatus, renderBuildStatusBadge } = require('../build-status')
const { BaseJsonService } = require('..')

const werckerSchema = Joi.array()
  .items(
    Joi.object({
      result: isBuildStatus,
    })
  )
  .min(0)
  .max(1)
  .required()

module.exports = class Wercker extends BaseJsonService {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'wercker',
      format:
        '(?:(?:ci/)([a-fA-F0-9]{24})|(?:build|ci)/([^/]+/[^/]+?))(?:/(.+?))?',
      capture: ['projectId', 'applicationName', 'branch'],
    }
  }

  static get examples() {
    return [
      {
        title: `Wercker CI Run`,
        pattern: 'ci/:applicationId',
        namedParams: { applicationId: '559e33c8e982fc615500b357' },
        staticPreview: this.render({ result: 'passed' }),
      },
      {
        title: `Wercker CI Run`,
        pattern: 'ci/:applicationId/:branch',
        namedParams: {
          applicationId: '559e33c8e982fc615500b357',
          branch: 'master',
        },
        staticPreview: this.render({ result: 'passed' }),
      },
      {
        title: `Wercker Build`,
        pattern: 'build/:userName/:applicationName',
        namedParams: {
          userName: 'wercker',
          applicationName: 'go-wercker-api',
        },
        staticPreview: this.render({ result: 'passed' }),
      },
      {
        title: `Wercker Build branch`,
        pattern: 'build/:userName/:applicationName/:branch',
        namedParams: {
          userName: 'wercker',
          applicationName: 'go-wercker-api',
          branch: 'master',
        },
        staticPreview: this.render({ result: 'passed' }),
      },
    ]
  }

  static render({ result }) {
    return renderBuildStatusBadge({ status: result })
  }

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
        result: 'not built',
      })
    }
    const { result } = json[0]
    return this.constructor.render({ result })
  }
}
