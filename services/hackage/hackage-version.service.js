'use strict'

const { renderVersionBadge } = require('../version')
const { BaseService, InvalidResponse } = require('..')

module.exports = class HackageVersion extends BaseService {
  static category = 'version'

  static route = {
    base: 'hackage/v',
    pattern: ':packageName',
  }

  static examples = [
    {
      title: 'Hackage',
      namedParams: { packageName: 'lens' },
      staticPreview: renderVersionBadge({ version: '4.1.7' }),
    },
  ]

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
