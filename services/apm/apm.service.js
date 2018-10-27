'use strict'

const Joi = require('joi')
const { renderLicenseBadge } = require('../../lib/licenses')
const { renderVersionBadge } = require('../../lib/version')
const { metric } = require('../../lib/text-formatters')
const BaseJsonService = require('../base-json')
const { InvalidResponse } = require('../errors')
const { nonNegativeInteger } = require('../validators')

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

  static get examples() {
    return [
      {
        exampleUrl: 'vim-mode',
        urlPattern: ':package',
        staticExample: this.render({ downloads: '60043' }),
        keywords: ['atom'],
      },
    ]
  }
}

class APMVersion extends BaseAPMService {
  static render({ version }) {
    return renderVersionBadge({ version })
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

  static get examples() {
    return [
      {
        exampleUrl: 'vim-mode',
        urlPattern: ':package',
        staticExample: this.render({ version: '0.6.0' }),
        keywords: ['atom'],
      },
    ]
  }
}

class APMLicense extends BaseAPMService {
  static render({ license }) {
    return renderLicenseBadge({ license })
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

  static get examples() {
    return [
      {
        exampleUrl: 'vim-mode',
        urlPattern: ':package',
        staticExample: this.render({ license: 'MIT' }),
        keywords: ['atom'],
      },
    ]
  }
}

module.exports = {
  APMDownloads,
  APMVersion,
  APMLicense,
}
