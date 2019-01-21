'use strict'

const { BaseSpigetService, documentation, keywords } = require('./spiget-base')

module.exports = class SpigetTestedVersions extends BaseSpigetService {
  static get route() {
    return {
      base: 'spiget/tested-versions',
      pattern: ':resourceid',
    }
  }

  static get defaultBadgeData() {
    return {
      label: 'tested versions',
      color: 'blue',
    }
  }

  async handle({ resourceid }) {
    const { testedVersions } = await this.fetch({ resourceid })
    const { versions } = this.transform({ testedVersions })
    return this.constructor.render({ versions })
  }

  transform({ testedVersions }) {
    const earliest = testedVersions[0]
    const latest = testedVersions.slice(-1)[0]
    let versions = ''
    if (earliest === latest) {
      versions = earliest
    } else {
      versions = `${earliest}-${latest}`
    }
    return { versions }
  }

  static render({ versions }) {
    return {
      message: versions,
    }
  }

  static get examples() {
    return [
      {
        title: 'Spiget Tested Versions',
        namedParams: {
          resourceid: '9089',
        },
        staticPreview: this.render({ versions: '1.7-1.13' }),
        documentation,
        keywords,
      },
    ]
  }
}
