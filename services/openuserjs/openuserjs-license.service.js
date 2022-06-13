import { renderLicenseBadge } from '../licenses.js'
import BaseOpenUserJSService from './openuserjs-base.js'

export default class OpenUserJSVersion extends BaseOpenUserJSService {
  static category = 'license'
  static route = { base: 'openuserjs/l', pattern: ':author/:scriptName' }

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

  async handle({ author, scriptName }) {
    const data = await this.fetch({ author, scriptName })
    return renderLicenseBadge({
      licenses: [data.UserScript.license[0].value],
    })
  }
}
