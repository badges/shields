'use strict'

const { BaseService } = require('..')

module.exports = class HackageDeps extends BaseService {
  static get category() {
    return 'dependencies'
  }

  static get route() {
    return {
      base: 'hackage-deps/v',
      pattern: ':packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'Hackage-Deps',
        namedParams: { packageName: 'lens' },
        staticPreview: this.render({ isOutdated: false }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'dependencies' }
  }

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
