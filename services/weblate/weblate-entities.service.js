import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { metric } from '../text-formatters.js'
import WeblateBase, { defaultServer } from './weblate-base.js'

const schema = Joi.object({
  count: nonNegativeInteger,
}).required()

export default class WeblateEntities extends WeblateBase {
  static category = 'other'

  static route = {
    base: 'weblate',
    pattern: ':type(components|projects|users|languages)',
    queryParamSchema: this.queryParamSchema,
  }

  static examples = [
    {
      title: 'Weblate entities',
      namedParams: { type: 'projects' },
      queryParams: { server: defaultServer },
      staticPreview: this.render({ type: 'projects', count: 533 }),
      keywords: ['i18n', 'internationalization'],
    },
  ]

  static defaultBadgeData = { color: 'informational' }

  static render({ type, count }) {
    return { label: type, message: metric(count) }
  }

  async fetch({ type, server = defaultServer }) {
    return super.fetch({
      schema,
      url: `${server}/api/${type}/`,
      httpErrors: {
        403: 'access denied by remote server',
      },
      logErrors: server === defaultServer ? [429] : [],
    })
  }

  async handle({ type }, { server }) {
    const { count } = await this.fetch({ type, server })
    return this.constructor.render({ type, count })
  }
}
