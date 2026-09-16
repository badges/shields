import { renderVersionBadge } from '../version.js'
import { pathParam } from '../index.js'
import WingetBase from './winget-base.js'

export default class WingetVersion extends WingetBase {
  static category = 'version'

  static route = {
    base: 'winget/v',
    pattern: ':name',
  }

  static openApi = {
    '/winget/v/{name}': {
      get: {
        summary: 'WinGet Package Version',
        description: 'WinGet Community Repository',
        parameters: [
          pathParam({
            name: 'name',
            example: 'Microsoft.WSL',
          }),
        ],
      },
    },
  }

  async handle({ name }) {
    const version = await this.getLatestVersion({ name })
    return renderVersionBadge({ version })
  }
}
