import { InvalidResponse } from '../index.js'
import { renderLicenseBadge } from '../licenses.js'
import BaseOpenUserJSService from './openuserjs-base.js'

export default class OpenUserJSLicense extends BaseOpenUserJSService {
  static category = 'license'
  static route = { base: 'openuserjs', pattern: 'l/:username/:scriptname' }

  static examples = [
    {
      title: 'OpenUserJS',
      namedParams: {
        username: 'NatoBoram',
        scriptname: 'YouTube_Comment_Blacklist',
      },
      staticPreview: renderLicenseBadge({ licenses: ['GPL-3.0-or-later'] }),
    },
  ]

  static defaultBadgeData = { label: 'license' }

  transform(data) {
    if (!('license' in data.UserScript)) {
      throw new InvalidResponse({
        prettyMessage: 'license not found',
      })
    }
    const licenses = data.UserScript.license.map(
      license => license.value.split('; ')[0]
    )
    return { licenses: licenses.reverse() }
  }

  async handle({ username, scriptname }) {
    const data = await this.fetch({ username, scriptname })
    const { licenses } = this.transform(data)
    return renderLicenseBadge({ licenses })
  }
}
