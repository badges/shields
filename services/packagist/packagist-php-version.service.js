'use strict'

const { allVersionsSchema, BasePackagistService } = require('./packagist-base')
const { NotFound } = require('..')

module.exports = class PackagistPhpVersion extends BasePackagistService {
  static get category() {
    return 'platform-support'
  }

  static get route() {
    return {
      base: 'packagist/php-v',
      pattern: ':user/:repo/:version?',
    }
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

  static get defaultBadgeData() {
    return {
      label: 'php',
      color: 'blue',
    }
  }

  static render({ php }) {
    return {
      message: php,
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

    const packageVersion = allData.package.versions[version]
    if (!packageVersion.require || !packageVersion.require.php) {
      throw new NotFound({ prettyMessage: 'version requirement not found' })
    }

    return this.constructor.render({
      php: packageVersion.require.php,
    })
  }
}
