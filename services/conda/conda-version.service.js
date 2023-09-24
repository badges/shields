import { pathParams } from '../index.js'
import { addv as versionText } from '../text-formatters.js'
import { version as versionColor } from '../color-formatters.js'
import BaseCondaService from './conda-base.js'

export default class CondaVersion extends BaseCondaService {
  static category = 'version'
  static route = { base: 'conda', pattern: ':variant(v|vn)/:channel/:pkg' }

  static openApi = {
    '/conda/{variant}/{channel}/{package}': {
      get: {
        summary: 'Conda Version',
        parameters: pathParams(
          {
            name: 'variant',
            example: 'vn',
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

  static render({ variant, channel, version }) {
    return {
      label: variant === 'vn' ? channel : `conda | ${channel}`,
      message: versionText(version),
      color: versionColor(version),
    }
  }

  async handle({ variant, channel, pkg }) {
    const json = await this.fetch({ channel, pkg })
    return this.constructor.render({
      variant,
      channel,
      version: json.latest_version,
    })
  }
}
