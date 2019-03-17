'use strict'

const { renderVersionBadge } = require('../../lib/version')
const { isStable: phpStableVersion } = require('../../lib/php-version')
const {
  allVersionsSchema,
  keywords,
  BasePackagistService,
} = require('./packagist-base')

module.exports = class PackagistVersion extends BasePackagistService {
  static get route() {
    return {
      base: 'packagist',
      pattern: ':type(v|vpre)/:user/:repo',
    }
  }

  static get defaultBadgeData() {
    return {
      label: 'packagist',
    }
  }

  async handle({ type, user, repo }) {
    switch (type) {
      case 'vpre':
        const {
          package: {
            versions: {
              'dev-master': {
                extra: {
                  'branch-alias': { 'dev-master': version },
                },
              },
            },
          },
        } = await this.fetch({ user, repo })
        return renderVersionBadge({ version })
      case 'v':
        const allData = await this.fetch({
          user,
          repo,
          schema: allVersionsSchema,
        })
        const versionsData = allData.package.versions
        const versions = Object.keys(versionsData)
        const stableVersions = versions.filter(phpStableVersion)
        return renderVersionBadge({ version: stableVersions[0] })
    }
  }

  static get category() {
    return 'version'
  }
  static get examples() {
    return [
      {
        title: 'Packagist',
        pattern: 'v/:user/:repo',
        namedParams: {
          user: 'symfony',
          repo: 'symfony',
        },
        staticPreview: renderVersionBadge({ version: '4.2.2' }),
        keywords,
      },
      {
        title: 'Packagist Pre Release',
        pattern: 'vpre/:user/:repo',
        namedParams: {
          user: 'symfony',
          repo: 'symfony',
        },
        staticPreview: renderVersionBadge({ version: '4.3-dev' }),
        keywords,
      },
    ]
  }
}
