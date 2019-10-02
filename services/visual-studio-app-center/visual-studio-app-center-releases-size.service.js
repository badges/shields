'use strict'

const Joi = require('@hapi/joi')
const {
  BaseVisualStudioAppCenterService,
  keywords,
  documentation,
} = require('./visual-studio-app-center-base')

const schema = Joi.object({
  size: Joi.number().required(),
}).required()

module.exports = class VisualStudioAppCenterReleasesSize extends BaseVisualStudioAppCenterService {
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

  async handle({ owner, app, token }) {
    const { size } = await this.fetch({ owner, app, token, schema })
    return this.constructor.render({ size })
  }
}
