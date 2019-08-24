'use strict'

const Joi = require('@hapi/joi')
const { isBuildStatus, renderBuildStatusBadge } = require('../build-status')
const { BaseJsonService, NotFound } = require('..')

const schema = Joi.array().items({
  result: isBuildStatus.required(),
})

const keywords = [
  'visual-studio',
  'vsac',
  'visual-studio-app-center',
  'app-center',
]

const documentation =
  "You will need to create a <b>read-only</b> API token <a target='_blank' href='https://appcenter.ms/settings/apitokens'>here</a>."

module.exports = class VisualStudioAppCenterBuilds extends BaseJsonService {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'vsac/builds',
      pattern: ':owner/:app/:branch/:token',
    }
  }

  static get examples() {
    return [
      {
        title: 'Visual Studio App Center Builds',
        namedParams: {
          owner: 'jct',
          app: 'my-amazing-app',
          branch: 'master',
          token: 'ac70cv...',
        },
        staticPreview: renderBuildStatusBadge({ status: 'succeeded' }),
        keywords,
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'build',
    }
  }

  async fetch({ owner, app, branch, token }) {
    const url = `https://api.appcenter.ms/v0.1/apps/${owner}/${app}/branches/${branch}/builds`

    return this._requestJson({
      schema,
      options: {
        headers: {
          'X-API-Token': token,
        },
      },
      errorMessages: {
        401: 'invalid token',
      },
      url,
    })
  }

  async handle({ owner, app, branch, token }) {
    const json = await this.fetch({ owner, app, branch, token })
    if (json[0] == undefined)
      throw new NotFound({ prettyMessage: 'no builds found' })
    return renderBuildStatusBadge({ status: json[0].result })
  }
}
