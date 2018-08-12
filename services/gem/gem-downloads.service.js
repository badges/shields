'use strict'

const semver = require('semver')
const Joi = require('joi')

const BaseJsonService = require('../base-json')
const { InvalidResponse } = require('../errors')
const {
  downloadCount: downloadCountColor,
} = require('../../lib/color-formatters')
const { metric } = require('../../lib/text-formatters')
const { latest: latestVersion } = require('../../lib/version')
const { nonNegativeInteger } = require('../validators.js')

const gemsSchema = Joi.object({
  downloads: nonNegativeInteger,
  version_downloads: nonNegativeInteger,
}).required()

const versionsSchema = Joi.array()
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
  async fetch({ repo, info }) {
    const endpoint = info === 'dv' ? 'versions/' : 'gems/'
    const schema = info === 'dv' ? versionsSchema : gemsSchema
    const url = `https://rubygems.org/api/v1/${endpoint}${repo}.json`
    return this._requestJson({
      url,
      schema,
    })
  }

  static render({ label, downloads }) {
    return {
      label: label,
      message: metric(downloads),
      color: downloadCountColor(downloads),
    }
  }

  _getLabel(version, info) {
    if (version) {
      return 'downloads@' + version
    } else {
      if (info === 'dtv') {
        return 'downloads@latest'
      } else {
        return 'downloads'
      }
    }
  }

  async handle({ info, rubygem }) {
    const splitRubygem = rubygem.split('/')
    const repo = splitRubygem[0]
    let version =
      splitRubygem.length > 1 ? splitRubygem[splitRubygem.length - 1] : null
    version = version === 'stable' ? version : semver.valid(version)
    const label = this._getLabel(version, info)
    const json = await this.fetch({ repo, info })

    let downloads
    if (info === 'dt') {
      downloads = json.downloads
    } else if (info === 'dtv') {
      downloads = json.version_downloads
    } else if (info === 'dv') {
      let versionData
      if (version !== null && version === 'stable') {
        const versions = json
          .filter(function(ver) {
            return ver.prerelease === false
          })
          .map(function(ver) {
            return ver.number
          })
        // Found latest stable version.
        const stableVersion = latestVersion(versions)
        versionData = json.filter(function(ver) {
          return ver.number === stableVersion
        })[0]
        downloads = versionData.downloads_count
      } else if (version !== null) {
        versionData = json.filter(function(ver) {
          return ver.number === version
        })[0]

        downloads = versionData.downloads_count
      } else {
        throw new InvalidResponse({
          underlyingError: new Error('version is null'),
        })
      }
    } else {
      throw new InvalidResponse({
        underlyingError: new Error('info is invalid'),
      })
    }

    return this.constructor.render({ label, downloads })
  }

  // Metadata
  static get defaultBadgeData() {
    return { label: 'downloads' }
  }

  static get category() {
    return 'downloads'
  }

  static get url() {
    return {
      base: 'gem',
      format: '(dt|dtv|dv)/(.+)',
      capture: ['info', 'rubygem'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Gem',
        previewUrl: 'dv/rails/stable',
        keywords: ['ruby'],
      },
      {
        title: 'Gem',
        previewUrl: 'dv/rails/4.1.0',
        keywords: ['ruby'],
      },
      {
        title: 'Gem',
        previewUrl: 'dtv/rails',
        keywords: ['ruby'],
      },
      {
        title: 'Gem',
        previewUrl: 'dt/rails',
        keywords: ['ruby'],
      },
    ]
  }
}
