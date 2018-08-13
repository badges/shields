'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')
const { InvalidResponse } = require('../errors')
const { version: versionColor } = require('../../lib/color-formatters')
const { metric, addv } = require('../../lib/text-formatters')
const { nonNegativeInteger } = require('../validators.js')

const apmSchema = Joi.object({
  downloads: nonNegativeInteger,
  releases: Joi.object({
    latest: Joi.string().required(),
  }),
  metadata: Joi.object({
    license: Joi.string().required(),
  }),
})

class BaseAPMService extends BaseJsonService {
  async fetch({ repo }) {
    return this._requestJson({
      schema: apmSchema,
      url: `https://atom.io/api/packages/${repo}`,
      notFoundMessage: 'package not found',
    })
  }

  static get defaultBadgeData() {
    return { label: 'apm' }
  }

  static get examples() {
    return [
      {
        previewUrl: 'vim-mode',
        keywords: ['atom'],
      },
    ]
  }
}

class APMDownloads extends BaseAPMService {
  static render({ downloads }) {
    return { message: metric(downloads), color: 'green' }
  }

  async handle({ repo }) {
    const json = await this.fetch({ repo })
    return this.constructor.render({ downloads: json.downloads })
  }

  static get category() {
    return 'downloads'
  }

  static get defaultBadgeData() {
    return { label: 'downloads' }
  }

  static get url() {
    return {
      base: 'apm/dm',
      format: '(.+)',
      capture: ['repo'],
    }
  }
}

class APMVersion extends BaseAPMService {
  static render({ version }) {
    return { message: addv(version), color: versionColor(version) }
  }

  async handle({ repo }) {
    const json = await this.fetch({ repo })

    const version = json.releases.latest
    if (!version)
      throw new InvalidResponse({
        underlyingError: new Error('version is invalid'),
      })
    return this.constructor.render({ version })
  }

  static get category() {
    return 'version'
  }

  static get url() {
    return {
      base: 'apm/v',
      format: '(.+)',
      capture: ['repo'],
    }
  }
}

class APMLicense extends BaseAPMService {
  static render({ license }) {
    return { message: license, color: 'blue' }
  }

  async handle({ repo }) {
    const json = await this.fetch({ repo })

    const license = json.metadata.license
    if (!license)
      throw new InvalidResponse({
        underlyingError: new Error('licence is invalid'),
      })
    return this.constructor.render({ license })
  }

  static get defaultBadgeData() {
    return { label: 'license' }
  }

  static get category() {
    return 'license'
  }

  static get url() {
    return {
      base: 'apm/l',
      format: '(.+)',
      capture: ['repo'],
    }
  }
}

module.exports = {
  APMDownloads,
  APMVersion,
  APMLicense,
}
