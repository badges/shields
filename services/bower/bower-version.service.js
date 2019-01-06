'use strict'

const BaseBowerService = require('./bower-base')
const { renderVersionBadge } = require('../../lib/version')
const { InvalidResponse } = require('../errors')

module.exports = class BowerVersion extends BaseBowerService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'bower',
      pattern: ':vtype(v|vpre)/:packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'Bower',
        namedParams: { vtype: 'v', packageName: 'bootstrap' },
        pattern: 'v/:packageName',
        staticExample: renderVersionBadge({ version: '4.2.1' }),
      },
      {
        title: 'Bower Pre Release',
        namedParams: { vtype: 'vpre', packageName: 'bootstrap' },
        pattern: 'vpre/:packageName',
        staticExample: renderVersionBadge({ version: '4.2.1' }),
      },
    ]
  }

  async handle({ vtype, packageName }) {
    const data = await this.fetch({ packageName })

    if (vtype === 'v') {
      if (data.latest_stable_release) {
        return renderVersionBadge({ version: data.latest_stable_release.name })
      }
    } else {
      if (data.latest_release_number) {
        return renderVersionBadge({ version: data.latest_release_number })
      }
    }
    throw new InvalidResponse({ prettyMessage: 'no releases' })
  }
}
