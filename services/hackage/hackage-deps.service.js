import { BaseService, pathParams } from '../index.js'

export default class HackageDeps extends BaseService {
  static category = 'dependencies'

  static route = {
    base: 'hackage-deps/v',
    pattern: ':packageName',
  }

  static openApi = {
    '/hackage-deps/v/{packageName}': {
      get: {
        summary: 'Hackage Dependencies',
        parameters: pathParams({
          name: 'packageName',
          example: 'lens',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'dependencies' }

  static render({ isOutdated }) {
    if (isOutdated) {
      return { message: 'outdated', color: 'orange' }
    } else {
      return { message: 'up to date', color: 'brightgreen' }
    }
  }

  async handle({ packageName }) {
    const reverseUrl = `http://packdeps.haskellers.com/licenses/${packageName}`
    const feedUrl = `http://packdeps.haskellers.com/feed/${packageName}`

    // first call /reverse to check if the package exists
    // this will throw a 404 if it doesn't
    await this._request({ url: reverseUrl })

    // if the package exists, then query /feed to check the dependencies
    const { buffer } = await this._request({ url: feedUrl })

    const outdatedStr = `Outdated dependencies for ${packageName} `
    const isOutdated = buffer.includes(outdatedStr)
    return this.constructor.render({ isOutdated })
  }
}
