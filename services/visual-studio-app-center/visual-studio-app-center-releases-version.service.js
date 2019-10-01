'use strict'

const Joi = require('@hapi/joi')
const { renderVersionBadge } = require('../version')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  version: Joi.string().required(),
  short_version: Joi.string().required(),
}).required()

const keywords = [
  'visual-studio',
  'vsac',
  'visual-studio-app-center',
  'app-center',
]

const documentation =
  "You will need to create a <b>read-only</b> API token <a target='_blank' href='https://appcenter.ms/settings/apitokens'>here</a>."

module.exports = class VisualStudioAppCenterReleasesVersion extends BaseJsonService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'vsac/releases/version',
      pattern: ':owner/:app/:token',
    }
  }

  static get examples() {
    return [
      {
        title: 'Visual Studio App Center Releases',
        namedParams: {
          owner: 'jct',
          app: 'my-amazing-app',
          token: 'ac70cv...',
        },
        staticPreview: renderVersionBadge({ version: '1.0 (4)' }),
        keywords,
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'release',
    }
  }

  async fetch({ owner, app, token }) {
    const url = `https://api.appcenter.ms/v0.1/apps/${owner}/${app}/releases/latest`

    return this._requestJson({
      schema,
      options: {
        headers: {
          'X-API-Token': token,
        },
      },
      errorMessages: {
        401: 'invalid token',
        403: 'project not found',
        404: 'project not found',
      },
      url,
    })
  }

  async handle({ owner, app, branch, token }) {
    const json = await this.fetch({ owner, app, branch, token })
    return renderVersionBadge({
      version: `${json.short_version} (${json.version})`,
    })
  }
}
