'use strict'

const Joi = require('@hapi/joi')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  size: Joi.number().required(),
}).required()

const keywords = [
  'visual-studio',
  'vsac',
  'visual-studio-app-center',
  'app-center',
]

const documentation =
  "You will need to create a <b>read-only</b> API token <a target='_blank' href='https://appcenter.ms/settings/apitokens'>here</a>."

module.exports = class VisualStudioAppCenterReleasesSize extends BaseJsonService {
  static get category() {
    return 'size'
  }

  static get route() {
    return {
      base: 'vsac/releases/size',
      pattern: ':owner/:app/:token',
    }
  }

  static get examples() {
    return [
      {
        title: 'Visual Studio App Center Size',
        namedParams: {
          owner: 'jct',
          app: 'my-amazing-app',
          token: 'ac70cv...',
        },
        staticPreview: this.render({ size: 8368844 }),
        keywords,
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'size',
      color: 'blue',
    }
  }

  static render({ size }) {
    return {
      message: `${(size / 1048576).toString().substring(0, 4)} MB`,
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
    return this.constructor.render({ size: json.size })
  }
}
