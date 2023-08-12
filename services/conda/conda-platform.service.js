import { pathParams } from '../index.js'
import BaseCondaService from './conda-base.js'

export default class CondaPlatform extends BaseCondaService {
  static category = 'platform-support'
  static route = { base: 'conda', pattern: ':variant(p|pn)/:channel/:pkg' }

  static openApi = {
    '/conda/{variant}/{channel}/{package}': {
      get: {
        summary: 'Conda Platform',
        parameters: pathParams(
          {
            name: 'variant',
            example: 'pn',
            schema: { type: 'string', enum: this.getEnum('variant') },
          },
          {
            name: 'channel',
            example: 'conda-forge',
          },
          {
            name: 'package',
            example: 'python',
          },
        ),
      },
    },
  }

  static render({ variant, platforms }) {
    return {
      label: variant === 'pn' ? 'platform' : 'conda|platform',
      message: platforms.join(' | '),
    }
  }

  async handle({ variant, channel, pkg }) {
    const json = await this.fetch({ channel, pkg })
    return this.constructor.render({ variant, platforms: json.conda_platforms })
  }
}
