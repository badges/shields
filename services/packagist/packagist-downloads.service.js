'use strict'

const { metric } = require('../text-formatters')
const { downloadCount } = require('../color-formatters')
const { keywords, BasePackagistService } = require('./packagist-base')

const periodMap = {
  dm: {
    field: 'monthly',
    suffix: '/month',
  },
  dd: {
    field: 'daily',
    suffix: '/day',
  },
  dt: {
    field: 'total',
    suffix: '',
  },
}

module.exports = class PackagistDownloads extends BasePackagistService {
  static get route() {
    return {
      base: 'packagist',
      pattern: ':interval(dm|dd|dt)/:user/:repo',
    }
  }

  static get defaultBadgeData() {
    return {
      label: 'downloads',
    }
  }

  async handle({ interval, user, repo }) {
    const {
      package: { downloads },
    } = await this.fetch({ user, repo })

    return this.constructor.render({
      downloads: downloads[periodMap[interval].field],
      interval,
    })
  }

  static render({ downloads, interval }) {
    return {
      message: metric(downloads) + periodMap[interval].suffix,
      color: downloadCount(downloads),
    }
  }

  static get category() {
    return 'downloads'
  }
  static get examples() {
    return [
      {
        title: 'Packagist',
        namedParams: {
          interval: 'dm',
          user: 'doctrine',
          repo: 'orm',
        },
        staticPreview: this.render({
          downloads: { monthly: 1000000 },
          interval: 'dm',
        }),
        keywords,
      },
    ]
  }
}
