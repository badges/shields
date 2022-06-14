import { InvalidResponse } from '../index.js'
import { renderLicenseBadge } from '../licenses.js'
import BaseOpenUserJSService from './openuserjs-base.js'

export default class OpenUserJSLicense extends BaseOpenUserJSService {
  static category = 'license'
  static route = { base: 'openuserjs', pattern: 'l/:author/:scriptName' }

  static examples = [
    {
      title: 'OpenUserJS',
      namedParams: {
        author: 'NatoBoram',
        scriptName: 'YouTube_Comment_Blacklist',
      },
      staticPreview: renderLicenseBadge({ licenses: ['GPL-3.0-or-later'] }),
    },
  ]

  static defaultBadgeData = { label: 'license' }

  transform(data) {
    if (!('license' in data)) {
      throw new InvalidResponse({
        prettyMessage: 'license not found',
      })
    }
    const licenses = data.UserScript.license.map(
      license => license.value.split('; ')[0]
    )
    return { licenses: licenses.reverse() }
  }

  async handle({ author, scriptName }) {
    const data = await this.fetch({ author, scriptName })
    const { licenses } = this.transform(data)
    return renderLicenseBadge({ licenses })
  }
}
