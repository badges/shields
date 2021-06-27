'use strict'

const Joi = require('joi')
const { BaseJsonService } = require('..')
const { optionalUrl } = require('../validators')

const schema = Joi.object({
  translated_percent: Joi.number().required(),
}).required()

const queryParamSchema = Joi.object({
  server: optionalUrl.required(),
}).required()

const documentation = `
  <p>
    This badge displays the percentage of strings translated on a project on a
    Weblate instance.
  </p>
`

module.exports = class WeblateProjectTranslatedPercentage extends (
  BaseJsonService
) {
  static category = 'other'
  static route = { base: 'weblate', pattern: ':project', queryParamSchema }

  static examples = [
    {
      title: 'Weblate project translated',
      namedParams: { project: 'godot-engine' },
      queryParams: { server: 'https://hosted.weblate.org' },
      staticPreview: this.render({ translatedPercent: 20.5 }),
      documentation,
      keywords: ['i18n', 'translation', 'internationalization'],
    },
  ]

  static defaultBadgeData = { label: 'translated' }

  /**
   * Takes a percentage and maps it to a message and color.
   *
   * The colors are determined based on how Weblate does it internally.
   * {@link https://github.com/WeblateOrg/weblate/blob/main/weblate/trans/widgets.py Weblate on GitHub}
   *
   * @param {*} translatedPercent The percentage of translations translated.
   * @returns {object} Format for the badge.
   */
  static render({ translatedPercent }) {
    if (translatedPercent >= 90)
      return { message: `${translatedPercent}%`, color: 'success' }

    if (translatedPercent >= 75)
      return { message: `${translatedPercent}%`, color: 'yellow' }

    return { message: `${translatedPercent}%`, color: 'critical' }
  }

  async fetch({ project, server }) {
    return this._requestJson({
      schema,
      url: `${server}/api/projects/${project}/statistics/`,
      errorMessages: {
        403: 'access denied',
        404: 'not found',
        429: 'rate limited by remote server',
      },
    })
  }

  async handle({ project }, { server }) {
    const { translated_percent } = await this.fetch({ project, server })
    return this.constructor.render({ translatedPercent: translated_percent })
  }
}
