'use strict'

const semver = require('semver')
const Joi = require('joi')
const { downloadCount } = require('../color-formatters')
const { metric } = require('../text-formatters')
const { latest: latestVersion } = require('../version')
const { BaseJsonService, InvalidParameter, InvalidResponse } = require('..')
const { nonNegativeInteger } = require('../validators')

const keywords = ['ruby']

const gemSchema = Joi.object({
  downloads: nonNegativeInteger,
  version_downloads: nonNegativeInteger,
}).required()

const versionSchema = Joi.array()
  .items(
    Joi.object({
      prerelease: Joi.boolean().required(),
      number: Joi.string().required(),
      downloads_count: nonNegativeInteger,
    })
  )
  .min(1)
  .required()

module.exports = class GemDownloads extends BaseJsonService {
  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'gem',
      pattern: ':variant(dt|dtv|dv)/:gem/:version?',
    }
  }

  static get examples() {
    return [
      {
        title: 'Gem',
        pattern: 'dv/:gem/:version',
        namedParams: {
          gem: 'rails',
          version: 'stable',
        },
        staticPreview: this.render({
          variant: 'dv',
          version: 'stable',
          downloads: 70000,
        }),
        keywords,
      },
      {
        title: 'Gem',
        pattern: 'dv/:gem/:version',
        namedParams: {
          gem: 'rails',
          version: '4.1.0',
        },
        staticPreview: this.render({
          variant: 'dv',
          version: '4.1.0',
          downloads: 50000,
        }),
        keywords,
      },
      {
        title: 'Gem',
        pattern: 'dtv/:gem',
        namedParams: { gem: 'rails' },
        staticPreview: this.render({
          variant: 'dtv',
          downloads: 70000,
        }),
        keywords,
      },
      {
        title: 'Gem',
        pattern: 'dt/:gem',
        namedParams: { gem: 'rails' },
        staticPreview: this.render({
          variant: 'dt',
          downloads: 900000,
        }),
        keywords,
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'downloads' }
  }

  static render({ variant, version, downloads }) {
    let label
    if (version) {
      label = `downloads@${version}`
    } else if (variant === 'dtv') {
      label = 'downloads@latest'
    }

    return {
      label,
      message: metric(downloads),
      color: downloadCount(downloads),
    }
  }

  async fetchDownloadCountForVersion({ gem, version }) {
    const json = await this._requestJson({
      url: `https://rubygems.org/api/v1/versions/${gem}.json`,
      schema: versionSchema,
      errorMessages: {
        404: 'gem not found',
      },
    })

    let wantedVersion
    if (version === 'stable') {
      wantedVersion = latestVersion(
        json.filter(({ prerelease }) => !prerelease).map(({ number }) => number)
      )
    } else {
      wantedVersion = version
    }

    const versionData = json.find(({ number }) => number === wantedVersion)
    if (versionData) {
      return versionData.downloads_count
    } else {
      throw new InvalidResponse({
        prettyMessage: 'version not found',
      })
    }
  }

  async fetchDownloadCountForGem({ gem }) {
    const {
      downloads: totalDownloads,
      version_downloads: versionDownloads,
    } = await this._requestJson({
      url: `https://rubygems.org/api/v1/gems/${gem}.json`,
      schema: gemSchema,
      errorMessages: {
        404: 'gem not found',
      },
    })
    return { totalDownloads, versionDownloads }
  }

  async handle({ variant, gem, version }) {
    let downloads
    if (variant === 'dv') {
      if (!version) {
        throw new InvalidParameter({
          prettyMessage: 'version downloads requires a version',
        })
      }
      if (version !== 'stable' && !semver.valid(version)) {
        throw new InvalidParameter({
          prettyMessage: 'version should be "stable" or valid semver',
        })
      }
      downloads = await this.fetchDownloadCountForVersion({ gem, version })
    } else {
      const {
        totalDownloads,
        versionDownloads,
      } = await this.fetchDownloadCountForGem({ gem, variant })
      downloads = variant === 'dtv' ? versionDownloads : totalDownloads
    }
    return this.constructor.render({ variant, version, downloads })
  }
}
