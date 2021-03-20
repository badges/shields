'use strict'

const Joi = require('joi')
const prettyBytes = require('pretty-bytes')
const { nonNegativeInteger } = require('../validators')
const {
  BaseVisualStudioAppCenterService,
  keywords,
  documentation,
} = require('./visual-studio-app-center-base')

const schema = Joi.object({
  size: nonNegativeInteger,
}).required()

module.exports = class VisualStudioAppCenterReleasesSize extends (
  BaseVisualStudioAppCenterService
) {
  static category = 'size'

  static route = {
    base: 'visual-studio-app-center/releases/size',
    pattern: ':owner/:app/:token',
  }

  static examples = [
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

  static defaultBadgeData = {
    label: 'size',
    color: 'blue',
  }

  static render({ size }) {
    return {
      message: prettyBytes(size),
    }
  }

  async handle({ owner, app, token }) {
    const { size } = await this.fetch({ owner, app, token, schema })
    return this.constructor.render({ size })
  }
}
