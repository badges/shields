import { pathParams } from '../index.js'
import { addv as versionText } from '../text-formatters.js'
import { version as versionColor } from '../color-formatters.js'
import BaseCondaService from './conda-base.js'

export default class CondaVersion extends BaseCondaService {
  static category = 'version'
  static route = {
    base: 'conda',
    pattern: ':variant(v|vn)/:channel/:packageName',
  }

  static openApi = {
    '/conda/{variant}/{channel}/{packageName}': {
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
            name: 'packageName',
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

  async handle({ variant, channel, packageName }) {
    const json = await this.fetch({ channel, packageName })
    return this.constructor.render({
      variant,
      channel,
      version: json.latest_version,
    })
  }
}
