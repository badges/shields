'use strict'

const { metric } = require('../text-formatters')
const { downloadCount } = require('../color-formatters')
const { keywords, BasePackagistService } = require('./packagist-base')

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

    return this.constructor.render({ downloads, interval })
  }

  static render({ downloads, interval }) {
    let amount
    let ending = ''

    switch (interval) {
      case 'dm':
        amount = downloads.monthly
        ending = '/month'
        break
      case 'dd':
        amount = downloads.daily
        ending = '/day'
        break
      case 'dt':
        amount = downloads.total
        break
    }

    return {
      message: metric(amount) + ending,
      color: downloadCount(amount),
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
