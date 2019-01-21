'use strict'

const { BaseSpigetService, documentation, keywords } = require('./spiget-base')

module.exports = class SpigetDownloadSize extends BaseSpigetService {
  static get route() {
    return {
      base: 'spiget/download-size',
      pattern: ':resourceid',
    }
  }

  static get defaultBadgeData() {
    return {
      label: 'size',
      color: 'blue',
    }
  }

  async handle({ resourceid }) {
    const { file } = await this.fetch({ resourceid })
    return this.constructor.render({ size: file.size, unit: file.sizeUnit })
  }

  static render({ size, unit }) {
    return {
      message: `${size} ${unit}`,
    }
  }

  static get category() {
    return 'size'
  }
  static get examples() {
    return [
      {
        title: 'Spiget Download Size',
        namedParams: {
          resourceid: '9089',
        },
        staticPreview: this.render({ size: 2.5, unit: 'MB' }),
        documentation,
        keywords,
      },
    ]
  }
}
