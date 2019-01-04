'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')

const depfuSchema = Joi.object({
  text: Joi.string().required(),
  colorscheme: Joi.string().required(),
}).required()

module.exports = class Depfu extends BaseJsonService {
  async fetch({ userRepo }) {
    const url = `https://depfu.com/github/shields/${userRepo}`
    return this._requestJson({ url, schema: depfuSchema })
  }

  static render({ text, colorscheme }) {
    return {
      message: text,
      color: colorscheme,
    }
  }

  async handle({ userRepo }) {
    const { text, colorscheme } = await this.fetch({ userRepo })
    return this.constructor.render({ text, colorscheme })
  }

  static get defaultBadgeData() {
    return { label: 'dependencies' }
  }

  static get category() {
    return 'dependencies'
  }

  static get route() {
    return {
      base: 'depfu',
      format: '(.+)',
      capture: ['userRepo'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Depfu',
        exampleUrl: 'depfu/example-ruby',
        pattern: ':user/:repo',
        staticExample: this.render({
          text: 'recent',
          colorscheme: 'brightgreen',
        }),
      },
    ]
  }
}
