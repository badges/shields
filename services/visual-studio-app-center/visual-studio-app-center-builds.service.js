'use strict'

const Joi = require('@hapi/joi')
const { BaseJsonService, NotFound } = require('..')

const schema = Joi.any()

const keywords = [
  'visual-studio',
  'vsac',
  'visual-studio-app-center',
  'app-center',
]

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
        staticPreview: this.render({ result: 'succeeded' }),
        keywords,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'build',
    }
  }

  static render({ result }) {
    return {
      message: result,
      color: result == 'succeeded' ? 'brightgreen' : 'red',
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
    return this.constructor.render({ result: json[0].result })
  }
}
