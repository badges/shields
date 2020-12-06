'use strict'

const { age } = require('../color-formatters')
const { formatDate } = require('../text-formatters')
const OpenVSXBase = require('./open-vsx-base')

module.exports = class OpenVSXReleaseDate extends OpenVSXBase {
  static category = 'activity'

  static route = {
    base: 'open-vsx',
    pattern: 'release-date/:namespace/:extension',
  }

  static examples = [
    {
      title: 'Open VSX Release Date',
      namedParams: {
        namespace: 'redhat',
        extension: 'java',
      },
      staticPreview: this.render({
        releaseDate: '2020-10-15T13:40:16.986723Z',
      }),
      keywords: this.keywords,
    },
  ]

  static defaultBadgeData = { label: 'release date' }

  static render({ releaseDate }) {
    return {
      message: formatDate(releaseDate),
      color: age(releaseDate),
    }
  }

  async handle({ namespace, extension }) {
    const { timestamp } = await this.fetch({ namespace, extension })
    return this.constructor.render({
      releaseDate: timestamp,
    })
  }
}
