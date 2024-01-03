import { pathParams } from '../index.js'
import { renderLicenseBadge } from '../licenses.js'
import BaseBowerService from './bower-base.js'

export default class BowerLicense extends BaseBowerService {
  static category = 'license'
  static route = { base: 'bower/l', pattern: ':packageName' }

  static openApi = {
    '/bower/l/{packageName}': {
      get: {
        summary: 'Bower License',
        parameters: pathParams({
          name: 'packageName',
          example: 'bootstrap',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'license' }

  async handle({ packageName }) {
    const data = await this.fetch({ packageName })
    return renderLicenseBadge({ licenses: data.normalized_licenses })
  }
}
