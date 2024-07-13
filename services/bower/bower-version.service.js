import { renderVersionBadge } from '../version.js'
import { InvalidResponse, pathParams } from '../index.js'
import BaseBowerService from './bower-base.js'

export default class BowerVersion extends BaseBowerService {
  static category = 'version'
  static route = { base: 'bower/v', pattern: ':packageName' }

  static openApi = {
    '/bower/v/{packageName}': {
      get: {
        summary: 'Bower Version',
        parameters: pathParams({
          name: 'packageName',
          example: 'bootstrap',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'bower' }

  static transform(data) {
    const version = data.latest_release_number

    if (!version) {
      throw new InvalidResponse({ prettyMessage: 'no releases' })
    }

    return version
  }

  async handle({ packageName }) {
    const data = await this.fetch({ packageName })
    const version = this.constructor.transform(data)

    return renderVersionBadge({ version })
  }
}
