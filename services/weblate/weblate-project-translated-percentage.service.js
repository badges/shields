import Joi from 'joi'
import { pathParam, queryParam } from '../index.js'
import { colorScale } from '../color-formatters.js'
import WeblateBase, { defaultServer, description } from './weblate-base.js'

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

  static openApi = {
    '/weblate/progress/{project}': {
      get: {
        summary: 'Weblate project translated',
        description,
        parameters: [
          pathParam({ name: 'project', example: 'godot-engine' }),
          queryParam({ name: 'server', example: defaultServer }),
        ],
      },
    },
  }

  static _cacheLength = 600

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

  async fetch({ project, server = defaultServer }) {
    return super.fetch({
      schema,
      url: `${server}/api/projects/${project}/statistics/`,
      httpErrors: {
        403: 'access denied by remote server',
        404: 'project not found',
      },
      logErrors: server === defaultServer ? [429] : [],
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
