'use strict'

const Joi = require('joi')
const { renderVersionBadge } = require('../../lib/version')
const {
  latestVersionSchema,
  BasePackagistService,
} = require('./packagist-base')

const {
  latest: phpLatestVersion,
  isStable: phpStableVersion,
} = require('../../lib/php-version')

const allVersionsSchema = Joi.object({
  package: Joi.object({
    versions: Joi.object()
      .pattern(/^/, Joi.object({ version: Joi.string() }))
      .required(),
  }).required(),
}).required()

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
    if (type === 'vpre') {
      // vpre
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
      } = await this.fetch({ user, repo, schema: latestVersionSchema })
      PackagistVersion.log(`latest-pre: ${version}`)
      return renderVersionBadge({ version })
    } else if (type === 'v') {
      // v
      const allData = await this.fetch({
        user,
        repo,
        schema: allVersionsSchema,
      })
      const versionsData = allData.package.versions
      const versions = Object.keys(versionsData)
      const stableVersions = versions.filter(phpStableVersion)
      let stableVersion = phpLatestVersion(stableVersions)
      if (!stableVersion) {
        stableVersion = phpLatestVersion(versions)
      }
      BasePackagistService.log(`latest: ${stableVersions[0]}`)
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
      },
      {
        title: 'Packagist Pre Release',
        pattern: 'vpre/:user/:repo',
        namedParams: {
          user: 'symfony',
          repo: 'symfony',
        },
        staticPreview: renderVersionBadge({ version: '4.3-dev' }),
      },
    ]
  }
}
