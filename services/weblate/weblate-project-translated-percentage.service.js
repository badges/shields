import Joi from 'joi'
import { colorScale } from '../color-formatters.js'
import WeblateBase from './weblate-base.js'

const schema = Joi.object({
  translated_percent: Joi.number().required(),
}).required()

/**
 * This badge displays the percentage of strings translated on a project on a
 * Weblate instance.
 */
export default class WeblateProjectTranslatedPercentage extends WeblateBase {
  static category = 'other'

  static route = {
    base: 'weblate/progress',
    pattern: ':project',
    queryParamSchema: this.queryParamSchema,
  }

  static examples = [
    {
      title: 'Weblate project translated',
      namedParams: { project: 'godot-engine' },
      queryParams: { server: 'https://hosted.weblate.org' },
      staticPreview: this.render({ translatedPercent: 20.5 }),
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
    const color = colorScale([75, 90])(translatedPercent)
    return { message: `${translatedPercent.toFixed(0)}%`, color }
  }

  async fetch({ project, server = 'https://hosted.weblate.org' }) {
    return super.fetch({
      schema,
      url: `${server}/api/projects/${project}/statistics/`,
      errorMessages: {
        403: 'access denied by remote server',
        404: 'project not found',
        429: 'rate limited by remote server',
      },
    })
  }

  async handle({ project }, { server }) {
    const { translated_percent: translatedPercent } = await this.fetch({
      project,
      server,
    })
    return this.constructor.render({ translatedPercent })
  }
}
