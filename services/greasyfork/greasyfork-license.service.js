import { renderLicenseBadge } from '../licenses.js'
import { InvalidResponse, pathParams } from '../index.js'
import BaseGreasyForkService from './greasyfork-base.js'

export default class GreasyForkLicense extends BaseGreasyForkService {
  static category = 'license'
  static route = { base: 'greasyfork', pattern: 'l/:scriptId' }

  static openApi = {
    '/greasyfork/l/{scriptId}': {
      get: {
        summary: 'Greasy Fork License',
        parameters: pathParams({
          name: 'scriptId',
          example: '407466',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'license' }

  transform({ data }) {
    if (data.license === null) {
      throw new InvalidResponse({
        prettyMessage: 'license not found',
      })
    }
    // remove suffix " License" from data.license
    return { license: data.license.replace(/ License$/, '') }
  }

  async handle({ scriptId }) {
    const data = await this.fetch({ scriptId })
    const { license } = this.transform({ data })
    return renderLicenseBadge({ licenses: [license] })
  }
}
