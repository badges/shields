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

  static get defaultBadgeData() {
    return { label: 'dependencies' }
  }

  static get examples() {
    return [
      {
        title: 'Hackage-Deps',
        namedParams: { packageName: 'lens' },
        staticPreview: this.render({ message: 'up to date' }),
      },
    ]
  }

  static render({ message }) {
    if (message === 'up to date') {
      return { message, color: 'brightgreen' }
    } else {
      return { message, color: 'orange' }
    }
  }

  async fetch({ url }) {
    return this._request({ url })
  }

  async handle({ packageName }) {
    const reverseUrl = `http://packdeps.haskellers.com/licenses/${packageName}`
    const feedUrl = `http://packdeps.haskellers.com/feed/${packageName}`

    // first call /reverse to check if the package exists
    // this will throw a 404 if it doesn't
    await this.fetch({ url: reverseUrl })

    // if the package exists, then query /feed to check the dependencies
    const { buffer } = await this.fetch({ url: feedUrl })

    const outdatedStr = `Outdated dependencies for ${packageName} `
    if (buffer.indexOf(outdatedStr) >= 0) {
      return this.constructor.render({ message: 'outdated' })
    } else {
      return this.constructor.render({ message: 'up to date' })
    }
  }
}
