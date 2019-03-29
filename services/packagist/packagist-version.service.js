'use strict'

const { InvalidResponse } = require('..')
const { renderVersionBadge } = require('../version')
const { isStable: phpStableVersion } = require('../php-version')
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

  transform({ type, json }) {
    const versions = json.package.versions
    if (type === 'vpre') {
      const devMasterVersion = versions['dev-master']
      if (!devMasterVersion.extra) {
        throw new InvalidResponse({
          prettyMessage: 'prerelease version data not available',
        })
      }
      const version = devMasterVersion.extra['branch-alias']['dev-master']
      return { version }
    } else {
      const stableVersions = Object.keys(versions).filter(phpStableVersion)
      return { version: stableVersions[0] }
    }
  }

  async handle({ type, user, repo }) {
    const json = await this.fetch({
      user,
      repo,
      schema: type === 'v' ? allVersionsSchema : undefined,
    })
    const { version } = this.transform({ type, json })
    return renderVersionBadge({ version })
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
