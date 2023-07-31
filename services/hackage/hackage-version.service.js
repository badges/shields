import { renderVersionBadge } from '../version.js'
import { BaseService, InvalidResponse, pathParams } from '../index.js'

export default class HackageVersion extends BaseService {
  static category = 'version'

  static route = {
    base: 'hackage/v',
    pattern: ':packageName',
  }

  static openApi = {
    '/hackage/v/{packageName}': {
      get: {
        summary: 'Hackage Version',
        parameters: pathParams({
          name: 'packageName',
          example: 'lens',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'hackage' }

  async fetch({ packageName }) {
    return this._request({
      url: `https://hackage.haskell.org/package/${packageName}/${packageName}.cabal`,
    })
  }

  static transform(data) {
    const lines = data.split('\n')
    const versionLines = lines.filter(e => /^version:/i.test(e) === true)
    return versionLines[0].split(/:/)[1].trim()
  }

  async handle({ packageName }) {
    const { buffer } = await this.fetch({ packageName })
    try {
      const version = this.constructor.transform(buffer)
      return renderVersionBadge({ version })
    } catch (e) {
      throw new InvalidResponse({ prettyMessage: 'invalid response data' })
    }
  }
}
