'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')
const { renderLicenseBadge } = require('../../lib/licenses')
const { renderVersionBadge } = require('../../lib/version')

const schema = Joi.object({
  license: Joi.array()
    .items(Joi.string())
    .single(),
  version: Joi.object({
    number: Joi.string().required(),
  }).required(),
}).required()

class BaseCtanService extends BaseJsonService {
  async fetch({ library }) {
    const url = `http://www.ctan.org/json/pkg/${library}`
    return this._requestJson({
      schema,
      url,
    })
  }

  static get defaultBadgeData() {
    return { label: 'ctan' }
  }
}

class CtanLicense extends BaseCtanService {
  static get defaultBadgeData() {
    return { label: 'license' }
  }

  static get category() {
    return 'license'
  }

  async handle({ library }) {
    const json = await this.fetch({ library })
    // when present, API returns licenses inconsistently ordered, so fix the order
    return renderLicenseBadge({ licenses: json.license && json.license.sort() })
  }

  static render({ licenses }) {
    return renderLicenseBadge({ licenses })
  }

  static get route() {
    return {
      base: 'ctan/l',
      format: '(.+)',
      capture: ['library'],
    }
  }

  static get examples() {
    return [
      {
        title: 'CTAN',
        exampleUrl: 'novel',
        pattern: ':library',
        staticExample: this.render({ licenses: ['ppl1.3c', 'ofl'] }),
        keywords: ['tex'],
      },
    ]
  }
}

class CtanVersion extends BaseCtanService {
  static get category() {
    return 'version'
  }

  async handle({ library }) {
    const json = await this.fetch({ library })
    return renderVersionBadge({ version: json.version.number })
  }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  static get route() {
    return {
      base: 'ctan/v',
      format: '(.+)',
      capture: ['library'],
    }
  }

  static get examples() {
    return [
      {
        title: 'CTAN',
        exampleUrl: 'tex',
        pattern: ':library',
        staticExample: this.render({ version: '3.14159265' }),
        keywords: ['tex'],
      },
    ]
  }
}

module.exports = {
  CtanLicense,
  CtanVersion,
}
