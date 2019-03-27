'use strict'

const { allVersionsSchema, BasePackagistService } = require('./packagist-base')
const { NotFound } = require('..')

module.exports = class PackagistPhpVersion extends BasePackagistService {
  static get route() {
    return {
      base: 'packagist/php-v',
      pattern: ':user/:repo/:version?',
    }
  }

  static get defaultBadgeData() {
    return {
      label: 'php',
      color: 'blue',
    }
  }

  async handle({ user, repo, version = 'dev-master' }) {
    const allData = await this.fetch({
      user,
      repo,
      schema: allVersionsSchema,
    })

    if (!allData.package.versions.hasOwnProperty(version)) {
      throw new NotFound({ prettyMessage: 'invalid version' })
    }

    return this.constructor.render({
      php: allData.package.versions[version].require.php,
    })
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
        pattern: ':user/:repo',
        namedParams: {
          user: 'symfony',
          repo: 'symfony',
        },
        staticPreview: this.render({ php: '^7.1.3' }),
      },
      {
        title: 'PHP from Packagist (specify version)',
        pattern: ':user/:repo/:version',
        namedParams: {
          user: 'symfony',
          repo: 'symfony',
          version: 'v2.8.0',
        },
        staticPreview: this.render({ php: '>=5.3.9' }),
      },
    ]
  }
}
