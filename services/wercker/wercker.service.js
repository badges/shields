'use strict'

const Joi = require('joi')
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

const werckerCIDocumentation = `
<p>
  Note that Wercker badge Key (used in Wercker's native badge urls) is not the same as
  the Application Id and the badge key will not work.
</p>
<p>
  You can use the Wercker API to locate your Application Id:
  <br />
  <br />
  https://app.wercker.com/api/v3/applications/:username/:applicationName
  <br />
  For example: https://app.wercker.com/api/v3/applications/wercker/go-wercker-api
  <br />
  <br />
  Your Application Id will be in the 'id' field in the API response.
</p>
`

module.exports = class Wercker extends BaseJsonService {
  static category = 'build'

  static route = {
    base: 'wercker',
    format:
      '(?:(?:ci/)([a-fA-F0-9]{24})|(?:build|ci)/([^/]+/[^/]+?))(?:/(.+?))?',
    capture: ['projectId', 'applicationName', 'branch'],
  }

  static examples = [
    {
      title: `Wercker CI Run`,
      pattern: 'ci/:applicationId',
      namedParams: { applicationId: '559e33c8e982fc615500b357' },
      staticPreview: this.render({ result: 'passed' }),
      documentation: werckerCIDocumentation,
    },
    {
      title: `Wercker CI Run`,
      pattern: 'ci/:applicationId/:branch',
      namedParams: {
        applicationId: '559e33c8e982fc615500b357',
        branch: 'master',
      },
      staticPreview: this.render({ result: 'passed' }),
      documentation: werckerCIDocumentation,
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
