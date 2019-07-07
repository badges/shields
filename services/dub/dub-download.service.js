'use strict'

const Joi = require('@hapi/joi')
const { metric } = require('../text-formatters')
const { downloadCount: downloadCountColor } = require('../color-formatters')
const { BaseJsonService } = require('..')
const { nonNegativeInteger } = require('../validators')

const schema = Joi.object({
  downloads: Joi.object({
    total: nonNegativeInteger,
    monthly: nonNegativeInteger,
    weekly: nonNegativeInteger,
    daily: nonNegativeInteger,
  }).required(),
})

const intervalMap = {
  dd: {
    transform: json => json.downloads.daily,
    messageSuffix: '/day',
  },
  dw: {
    transform: json => json.downloads.weekly,
    messageSuffix: '/week',
  },
  dm: {
    transform: json => json.downloads.monthly,
    messageSuffix: '/month',
  },
  dt: {
    transform: json => json.downloads.total,
    messageSuffix: '',
  },
}

module.exports = class DubDownloads extends BaseJsonService {
  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'dub',
      pattern: ':interval(dd|dw|dm|dt)/:packageName/:version*',
    }
  }

  static get examples() {
    return [
      {
        title: 'DUB',
        namedParams: { interval: 'dm', packageName: 'vibe-d' },
        staticPreview: this.render({ interval: 'dm', downloadCount: 5000 }),
      },
      {
        title: 'DUB (version)',
        namedParams: {
          interval: 'dm',
          packageName: 'vibe-d',
          version: '0.8.4',
        },
        staticPreview: this.render({
          interval: 'dm',
          version: '0.8.4',
          downloadCount: 100,
        }),
      },
      {
        title: 'DUB (latest)',
        namedParams: {
          interval: 'dm',
          packageName: 'vibe-d',
          version: 'latest',
        },
        staticPreview: this.render({
          interval: 'dm',
          version: 'latest',
          downloadCount: 100,
        }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'downloads' }
  }

  static render({ interval, version, downloadCount }) {
    const { messageSuffix } = intervalMap[interval]

    return {
      label: version ? `downloads@${version}` : 'downloads',
      message: `${metric(downloadCount)}${messageSuffix}`,
      color: downloadCountColor(downloadCount),
    }
  }

  async fetch({ packageName, version }) {
    let url = `https://code.dlang.org/api/packages/${packageName}`
    if (version) {
      url += `/${version}`
    }
    url += '/stats'
    return this._requestJson({ schema, url })
  }

  async handle({ interval, packageName, version }) {
    const { transform } = intervalMap[interval]

    const json = await this.fetch({ packageName, version })
    const downloadCount = transform(json)
    return this.constructor.render({ interval, downloadCount, version })
  }
}
