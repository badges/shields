import { renderLicenseBadge } from '../licenses.js'
import { InvalidResponse } from '../index.js'
import BaseGreasyForkService from './greasyfork-base.js'

export default class GreasyForkLicense extends BaseGreasyForkService {
  static category = 'license'
  static route = { base: 'greasyfork', pattern: 'l/:scriptId' }

  static examples = [
    {
      title: 'Greasy Fork',
      namedParams: { scriptId: '407466' },
      staticPreview: renderLicenseBadge({ licenses: ['MIT'] }),
    },
  ]

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
