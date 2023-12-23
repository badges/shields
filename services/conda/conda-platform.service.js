import { pathParams } from '../index.js'
import BaseCondaService from './conda-base.js'

export default class CondaPlatform extends BaseCondaService {
  static category = 'platform-support'
  static route = {
    base: 'conda',
    pattern: ':variant(p|pn)/:channel/:packageName',
  }

  static openApi = {
    '/conda/{variant}/{channel}/{packageName}': {
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
            name: 'packageName',
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

  async handle({ variant, channel, packageName }) {
    const json = await this.fetch({ channel, packageName })
    return this.constructor.render({ variant, platforms: json.conda_platforms })
  }
}
