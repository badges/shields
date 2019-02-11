'use strict'

const { BasePackagistService } = require('./packagist-base')

module.exports = class PackagistPhpVersion extends BasePackagistService {
  static get route() {
    return {
      base: 'packagist/php-v',
      pattern: ':user/:repo',
    }
  }

  static get defaultBadgeData() {
    return {
      label: 'php',
      color: 'blue',
    }
  }

  async handle({ user, repo }) {
    const {
      package: {
        versions: {
          'dev-master': {
            require: { php },
          },
        },
      },
    } = await this.fetch({ user, repo })
    return this.constructor.render({ php })
  }

  static render({ php }) {
    return {
      message: php,
    }
  }

  static get category() {
    return 'platform-support'
  }
  static get examples() {
    return [
      {
        title: 'PHP from Packagist',
        namedParams: {
          user: 'symfony',
          repo: 'symfony',
        },
        staticPreview: this.render({ php: '^7.1.3' }),
      },
    ]
  }
}
