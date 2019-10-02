'use strict'

const Joi = require('@hapi/joi')
const { renderVersionBadge } = require('../version')
const {
  BaseVisualStudioAppCenterService,
  keywords,
  documentation,
} = require('./visual-studio-app-center-base')

const schema = Joi.object({
  version: Joi.string().required(),
  short_version: Joi.string().required(),
}).required()

module.exports = class VisualStudioAppCenterReleasesVersion extends BaseVisualStudioAppCenterService {
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

  async handle({ owner, app, token }) {
    const json = await this.fetch({ owner, app, token, schema })
    return renderVersionBadge({
      version: `${json.short_version} (${json.version})`,
    })
  }
}
