'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')

const depfuSchema = Joi.object({
  text: Joi.string().required(),
  colorscheme: Joi.string().required(),
}).required()

module.exports = class Depfu extends BaseJsonService {
  async fetch({ user, repo }) {
    const url = `https://depfu.com/github/shields/${user}/${repo}`
    return this._requestJson({ url, schema: depfuSchema })
  }

  static render({ text, colorscheme }) {
    return {
      message: text,
      color: colorscheme,
    }
  }

  async handle({ user, repo }) {
    const { text, colorscheme } = await this.fetch({ user, repo })
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
      pattern: ':user/:repo',
    }
  }

  static get examples() {
    return [
      {
        title: 'Depfu',
        namedParams: { user: 'depfu', repo: 'example-ruby' },
        staticExample: this.render({
          text: 'recent',
          colorscheme: 'brightgreen',
        }),
      },
    ]
  }
}
