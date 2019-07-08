'use strict'

const Joi = require('@hapi/joi')
const { renderLicenseBadge } = require('../licenses')
const { renderVersionBadge } = require('../version')
const { metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')
const { BaseJsonService, InvalidResponse } = require('..')

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
  static get defaultBadgeData() {
    return { label: 'apm' }
  }

  async fetch({ packageName }) {
    return this._requestJson({
      schema,
      url: `https://atom.io/api/packages/${packageName}`,
      errorMessages: { 404: 'package not found' },
    })
  }
}

class APMDownloads extends BaseAPMService {
  static get category() {
    return 'downloads'
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

  static get defaultBadgeData() {
    return { label: 'downloads' }
  }

  static render({ downloads }) {
    return { message: metric(downloads), color: 'green' }
  }

  async handle({ packageName }) {
    const json = await this.fetch({ packageName })
    return this.constructor.render({ downloads: json.downloads })
  }
}

class APMVersion extends BaseAPMService {
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
}

class APMLicense extends BaseAPMService {
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

  static get defaultBadgeData() {
    return { label: 'license' }
  }

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
}

module.exports = {
  APMDownloads,
  APMVersion,
  APMLicense,
}
