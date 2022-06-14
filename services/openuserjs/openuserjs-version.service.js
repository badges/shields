import { renderVersionBadge } from '../version.js'
import BaseOpenUserJSService from './openuserjs-base.js'

export default class OpenUserJSVersion extends BaseOpenUserJSService {
  static category = 'version'
  static route = { base: 'openuserjs', pattern: 'v/:author/:scriptName' }

  static examples = [
    {
      title: 'OpenUserJS',
      namedParams: {
        author: 'NatoBoram',
        scriptName: 'YouTube_Comment_Blacklist',
      },
      staticPreview: renderVersionBadge({ version: '0.0.7' }),
    },
  ]

  async handle({ author, scriptName }) {
    const data = await this.fetch({ author, scriptName })
    return renderVersionBadge({
      version: data.UserScript.version[0].value,
    })
  }
}
