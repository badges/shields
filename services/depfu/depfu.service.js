'use strict'

const Joi = require('@hapi/joi')
const { BaseJsonService } = require('..')

const depfuSchema = Joi.object({
  text: Joi.string().required(),
  colorscheme: Joi.string().required(),
}).required()

module.exports = class Depfu extends BaseJsonService {
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
        staticPreview: this.render({
          text: 'recent',
          colorscheme: 'brightgreen',
        }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'dependencies' }
  }

  static render({ text, colorscheme }) {
    return {
      message: text,
      color: colorscheme,
    }
  }

  async fetch({ user, repo }) {
    const url = `https://depfu.com/github/shields/${user}/${repo}`
    return this._requestJson({ url, schema: depfuSchema })
  }

  async handle({ user, repo }) {
    const { text, colorscheme } = await this.fetch({ user, repo })
    return this.constructor.render({ text, colorscheme })
  }
}
