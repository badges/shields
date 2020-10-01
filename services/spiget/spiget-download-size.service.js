'use strict'

const { BaseSpigetService, documentation, keywords } = require('./spiget-base')

module.exports = class SpigetDownloadSize extends BaseSpigetService {
  static category = 'size'

  static route = {
    base: 'spiget/download-size',
    pattern: ':resourceId',
  }

  static examples = [
    {
      title: 'Spiget Download Size',
      namedParams: {
        resourceId: '9089',
      },
      staticPreview: this.render({ size: 2.5, unit: 'MB' }),
      documentation,
      keywords,
    },
  ]

  static defaultBadgeData = {
    label: 'size',
    color: 'blue',
  }

  static render({ size, unit, type }) {
    if (type === 'external') {
      return {
        message: `resource hosted externally`,
        color: 'lightgrey',
      }
    }
    return {
      message: `${size} ${unit}`,
    }
  }

  async handle({ resourceId }) {
    const { file } = await this.fetch({ resourceId })
    return this.constructor.render({
      size: file.size,
      unit: file.sizeUnit,
      type: file.type,
    })
  }
}
