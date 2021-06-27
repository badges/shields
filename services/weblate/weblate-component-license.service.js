'use strict'

const Joi = require('joi')
const { BaseJsonService } = require('..')
const { optionalUrl } = require('../validators')

const schema = Joi.object({
  license: Joi.string().required(),
}).required()

const queryParamSchema = Joi.object({
  server: optionalUrl.required(),
}).required()

const documentation = `
  <p>
    This badge displays the license of a component on a Weblate instance.
  </p>
`

module.exports = class WeblateComponentLicense extends BaseJsonService {
  static category = 'license'
  static route = {
    base: 'weblate/license',
    pattern: ':project/:component',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'Weblate component license',
      namedParams: { project: 'godot-engine', component: 'godot' },
      queryParams: { server: 'https://hosted.weblate.org' },
      staticPreview: this.render({ license: 'MIT' }),
      documentation,
      keywords: ['i18n', 'translation', 'internationalization'],
    },
  ]

  static defaultBadgeData = { label: 'license', color: 'blue' }

  static render({ license }) {
    return { message: `${license}` }
  }

  async fetch({ project, component, server }) {
    return this._requestJson({
      schema,
      url: `${server}/api/components/${project}/${component}/`,
      errorMessages: {
        403: 'access denied',
        404: 'not found',
        429: 'rate limited by remote server',
      },
    })
  }

  async handle({ project, component }, { server }) {
    const { license } = await this.fetch({ project, component, server })
    return this.constructor.render({ license })
  }
}
