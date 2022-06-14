import { InvalidResponse } from '../index.js'
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
    if (!('version' in data.UserScript)) {
      throw new InvalidResponse({
        prettyMessage: 'version not found',
      })
    }
    return renderVersionBadge({
      version: data.UserScript.version.at(-1).value,
    })
  }
}
