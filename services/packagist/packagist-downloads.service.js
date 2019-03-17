'use strict'

const { metric } = require('../text-formatters')
const { downloadCount } = require('../color-formatters')
const { keywords, BasePackagistService } = require('./packagist-base')

module.exports = class PackagistDownloads extends BasePackagistService {
  static get route() {
    return {
      base: 'packagist',
      pattern: ':type(dm|dd|dt)/:user/:repo',
    }
  }

  static get defaultBadgeData() {
    return {
      label: 'downloads',
    }
  }

  async handle({ type, user, repo }) {
    const {
      package: { downloads },
    } = await this.fetch({ user, repo })

    switch (type) {
      case 'dm':
        return this.constructor.render({
          downloads: downloads.monthly,
          ending: '/month',
        })
      case 'dd':
        return this.constructor.render({
          downloads: downloads.daily,
          ending: '/day',
        })
      case 'dt':
        return this.constructor.render({ downloads: downloads.total })
    }
  }

  static render({ downloads, ending = '' }) {
    return {
      message: metric(downloads) + ending,
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
        pattern: 'dm/:user/:repo',
        namedParams: {
          user: 'doctrine',
          repo: 'orm',
        },
        staticPreview: this.render({ downloads: 1000000, ending: '/month' }),
        keywords,
      },
      {
        title: 'Packagist Daily Downloads',
        pattern: 'dd/:user/:repo',
        namedParams: {
          user: 'doctrine',
          repo: 'orm',
        },
        staticPreview: this.render({ downloads: 49000, ending: '/day' }),
        keywords,
      },
      {
        title: 'Packagist Downloads',
        pattern: 'dt/:user/:repo',
        namedParams: {
          user: 'doctrine',
          repo: 'orm',
        },
        staticPreview: this.render({ downloads: 45000000 }),
        keywords,
      },
    ]
  }
}
