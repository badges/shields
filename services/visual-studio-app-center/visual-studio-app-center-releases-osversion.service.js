'use strict'

const Joi = require('joi')
const {
  BaseVisualStudioAppCenterService,
  keywords,
  documentation,
} = require('./visual-studio-app-center-base')

const schema = Joi.object({
  app_os: Joi.string().required(),
  min_os: Joi.string().required(),
}).required()

module.exports = class VisualStudioAppCenterReleasesOSVersion extends (
  BaseVisualStudioAppCenterService
) {
  static category = 'version'

  static route = {
    base: 'visual-studio-app-center/releases/osver',
    pattern: ':owner/:app/:token',
  }

  static examples = [
    {
      title: 'Visual Studio App Center (Minimum) OS Version',
      namedParams: {
        owner: 'jct',
        app: 'my-amazing-app',
        token: 'ac70cv...',
      },
      staticPreview: this.render({ minOS: '4.1', appOS: 'Android' }),
      keywords,
      documentation,
    },
  ]

  static defaultBadgeData = {
    label: 'min version',
    color: 'blue',
  }

  static render({ appOS, minOS }) {
    return {
      label: `${appOS.toLowerCase()}`,
      message: `${minOS}+`,
    }
  }

  async handle({ owner, app, token }) {
    const { app_os: appOS, min_os: minOS } = await this.fetch({
      owner,
      app,
      token,
      schema,
    })
    return this.constructor.render({ appOS, minOS })
  }
}
