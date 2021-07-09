import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const depfuSchema = Joi.object({
  text: Joi.string().required(),
  colorscheme: Joi.string().required(),
}).required()

export default class Depfu extends BaseJsonService {
  static category = 'dependencies'
  static route = { base: 'depfu', pattern: ':user/:repo' }
  static examples = [
    {
      title: 'Depfu',
      namedParams: { user: 'depfu', repo: 'example-ruby' },
      staticPreview: this.render({
        text: 'recent',
        colorscheme: 'brightgreen',
      }),
    },
  ]

  static defaultBadgeData = { label: 'dependencies' }

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
