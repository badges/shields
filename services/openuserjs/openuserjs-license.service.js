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
      documentation:
        'By the terms of service, scripts will be under an MIT License by default if not specified in the script metadata.',
    },
  ]

  static defaultBadgeData = { label: 'license' }

  static transform(data) {
    if (!('license' in data.UserScript)) {
      // By the TOS, the script will be under an MIT License by default if not specified
      // @see https://github.com/badges/shields/pull/8081#discussion_r898437399
      return { licenses: ['MIT'] }
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
