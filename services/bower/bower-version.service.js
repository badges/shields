'use strict'

const { renderVersionBadge } = require('../version')
const BaseBowerService = require('./bower-base')
const { InvalidResponse } = require('..')

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
        namedParams: { packageName: 'bootstrap' },
        pattern: 'v/:packageName',
        staticPreview: renderVersionBadge({ version: '4.2.1' }),
      },
      {
        title: 'Bower Pre Release',
        namedParams: { packageName: 'bootstrap' },
        pattern: 'vpre/:packageName',
        staticPreview: renderVersionBadge({ version: '4.2.1' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'bower' }
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
