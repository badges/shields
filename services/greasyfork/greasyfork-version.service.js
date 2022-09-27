import { renderVersionBadge } from '../version.js'
import BaseGreasyForkService from './greasyfork-base.js'

export default class GreasyForkVersion extends BaseGreasyForkService {
  static category = 'version'
  static route = { base: 'greasyfork', pattern: 'v/:scriptId' }

  static examples = [
    {
      title: 'Greasy Fork',
      namedParams: { scriptId: '407466' },
      staticPreview: renderVersionBadge({ version: '3.9.3' }),
    },
  ]

  async handle({ scriptId }) {
    const data = await this.fetch({ scriptId })
    return renderVersionBadge({ version: data.version })
  }
}
