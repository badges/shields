import Joi from 'joi'
import WeblateBase from './weblate-base.js'

const schema = Joi.object({
  license: Joi.string().required(),
}).required()

/**
 * This badge displays the license of a component on a Weblate instance.
 */
export default class WeblateComponentLicense extends WeblateBase {
  static category = 'license'

  static route = {
    base: 'weblate/l',
    pattern: ':project/:component',
    queryParamSchema: this.queryParamSchema,
  }

  static examples = [
    {
      title: 'Weblate component license',
      namedParams: { project: 'godot-engine', component: 'godot' },
      queryParams: { server: 'https://hosted.weblate.org' },
      staticPreview: this.render({ license: 'MIT' }),
      keywords: ['i18n', 'translation', 'internationalization'],
    },
  ]

  static defaultBadgeData = { label: 'license', color: 'informational' }

  static render({ license }) {
    return { message: `${license}` }
  }

  async fetch({ project, component, server = 'https://hosted.weblate.org' }) {
    return super.fetch({
      schema,
      url: `${server}/api/components/${project}/${component}/`,
      errorMessages: {
        403: 'access denied by remote server',
        404: 'component not found',
        429: 'rate limited by remote server',
      },
    })
  }

  async handle({ project, component }, { server }) {
    const { license } = await this.fetch({ project, component, server })
    return this.constructor.render({ license })
  }
}
