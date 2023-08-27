import { pathParams } from '../index.js'
import { renderVersionBadge } from '../version.js'
import BaseGreasyForkService from './greasyfork-base.js'

export default class GreasyForkVersion extends BaseGreasyForkService {
  static category = 'version'
  static route = { base: 'greasyfork', pattern: 'v/:scriptId' }

  static openApi = {
    '/greasyfork/v/{scriptId}': {
      get: {
        summary: 'Greasy Fork Version',
        parameters: pathParams({
          name: 'scriptId',
          example: '407466',
        }),
      },
    },
  }

  async handle({ scriptId }) {
    const data = await this.fetch({ scriptId })
    return renderVersionBadge({ version: data.version })
  }
}
