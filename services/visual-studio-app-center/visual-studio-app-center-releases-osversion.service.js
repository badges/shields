'use strict'

const Joi = require('@hapi/joi')
const {
  BaseVisualStudioAppCenterService,
  keywords,
  documentation,
} = require('./visual-studio-app-center-base')

const schema = Joi.object({
  app_os: Joi.string().required(),
  min_os: Joi.string().required(),
}).required()

module.exports = class VisualStudioAppCenterReleasesOSVersion extends BaseVisualStudioAppCenterService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'visual-studio-app-center/releases/osver',
      pattern: ':owner/:app/:token',
    }
  }

  static get examples() {
    return [
      {
        title: 'Visual Studio App Center (Minimum) OS Version',
        namedParams: {
          owner: 'jct',
          app: 'my-amazing-app',
          token: 'ac70cv...',
        },
        staticPreview: this.render({ min_os: '4.1', app_os: 'Android' }),
        keywords,
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'min version',
      color: 'blue',
    }
  }

  static render({ app_os, min_os }) {
    return {
      label: `${app_os.toLowerCase()}`,
      message: `${min_os}+`,
    }
  }

  async handle({ owner, app, token }) {
    const { app_os, min_os } = await this.fetch({ owner, app, token, schema })
    return this.constructor.render({ app_os, min_os })
  }
}
