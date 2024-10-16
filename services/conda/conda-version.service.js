import { pathParams } from '../index.js'
import { renderVersionBadge } from '../version.js'
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

  async handle({ variant, channel, packageName }) {
    const json = await this.fetch({ channel, packageName })
    const defaultLabel = variant === 'vn' ? channel : `conda | ${channel}`
    return renderVersionBadge({
      version: json.latest_version,
      defaultLabel,
    })
  }
}
