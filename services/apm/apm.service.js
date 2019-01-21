'use strict'

const Joi = require('joi')
const { renderLicenseBadge } = require('../../lib/licenses')
const { renderVersionBadge } = require('../../lib/version')
const { metric } = require('../../lib/text-formatters')
const { BaseJsonService, InvalidResponse } = require('..')
const { nonNegativeInteger } = require('../validators')

const keywords = ['atom']

const schema = Joi.object({
  downloads: nonNegativeInteger,
  releases: Joi.object({
    latest: Joi.string().required(),
  }),
  metadata: Joi.object({
    license: Joi.string().required(),
  }),
})

class BaseAPMService extends BaseJsonService {
  async fetch({ packageName }) {
    return this._requestJson({
      schema,
      url: `https://atom.io/api/packages/${packageName}`,
      errorMessages: { 404: 'package not found' },
    })
  }

  static get defaultBadgeData() {
    return { label: 'apm' }
  }
}

class APMDownloads extends BaseAPMService {
  static render({ downloads }) {
    return { message: metric(downloads), color: 'green' }
  }

  async handle({ packageName }) {
    const json = await this.fetch({ packageName })
    return this.constructor.render({ downloads: json.downloads })
  }

  static get category() {
    return 'downloads'
  }

  static get defaultBadgeData() {
    return { label: 'downloads' }
  }

  static get route() {
    return {
      base: 'apm/dm',
      pattern: ':packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'APM',
        namedParams: { packageName: 'vim-mode' },
        staticPreview: this.render({ downloads: '60043' }),
        keywords,
      },
    ]
  }
}

class APMVersion extends BaseAPMService {
  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle({ packageName }) {
    const json = await this.fetch({ packageName })

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

  static get route() {
    return {
      base: 'apm/v',
      pattern: ':packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'APM',
        namedParams: { packageName: 'vim-mode' },
        staticPreview: this.render({ version: '0.6.0' }),
        keywords,
      },
    ]
  }
}

class APMLicense extends BaseAPMService {
  static render({ license }) {
    return renderLicenseBadge({ license })
  }

  async handle({ packageName }) {
    const json = await this.fetch({ packageName })

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

  static get route() {
    return {
      base: 'apm/l',
      pattern: ':packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'APM',
        namedParams: { packageName: 'vim-mode' },
        staticPreview: this.render({ license: 'MIT' }),
        keywords,
      },
    ]
  }
}

module.exports = {
  APMDownloads,
  APMVersion,
  APMLicense,
}
