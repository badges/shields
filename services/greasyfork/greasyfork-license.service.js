import { renderLicenseBadge } from '../licenses.js'
import { InvalidResponse } from '../index.js'
import BaseGreasyForkService from './greasyfork-base.js'

class GreasyForkLicense extends BaseGreasyForkService {
  static category = 'license'

  static route = {
    base: 'greasyfork/l',
    pattern: ':scriptId',
  }

  static examples = [
    {
      title: 'Greasy Fork',
      namedParams: { scriptId: '407466' },
      staticPreview: this.render({ licenses: ['MIT License'] }),
    },
  ]

  static defaultBadgeData = { label: 'license' }

  static render({ licenses }) {
    return renderLicenseBadge({ licenses })
  }

  async handle({ scriptId }) {
    const data = await this.fetch({ scriptId })
    if (data.license === null) {
      throw new InvalidResponse({
        prettyMessage: 'version not found',
      })
    }
    // remove suffix " License" from data.license
    const license = data.license.replace(/ License$/, '')
    return this.constructor.render({
      licenses: [license],
    })
  }
}

export { GreasyForkLicense }
