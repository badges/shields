'use strict'

const Joi = require('@hapi/joi')
const { renderLicenseBadge } = require('../licenses')
const { renderVersionBadge } = require('../version')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  license: Joi.array()
    .items(Joi.string())
    .single(),
  version: Joi.object({
    number: Joi.string().required(),
  }).required(),
}).required()

class BaseCtanService extends BaseJsonService {
  static get defaultBadgeData() {
    return { label: 'ctan' }
  }

  async fetch({ library }) {
    const url = `http://www.ctan.org/json/pkg/${library}`
    return this._requestJson({
      schema,
      url,
    })
  }
}

class CtanLicense extends BaseCtanService {
  static get category() {
    return 'license'
  }

  static get route() {
    return {
      base: 'ctan/l',
      pattern: ':library',
    }
  }

  static get examples() {
    return [
      {
        title: 'CTAN',
        namedParams: { library: 'novel' },
        staticPreview: this.render({ licenses: ['ppl1.3c', 'ofl'] }),
        keywords: ['tex'],
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'license' }
  }

  static render({ licenses }) {
    return renderLicenseBadge({ licenses })
  }

  async handle({ library }) {
    const json = await this.fetch({ library })
    // when present, API returns licenses inconsistently ordered, so fix the order
    return renderLicenseBadge({ licenses: json.license && json.license.sort() })
  }
}

class CtanVersion extends BaseCtanService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'ctan/v',
      pattern: ':library',
    }
  }

  static get examples() {
    return [
      {
        title: 'CTAN',
        namedParams: { library: 'tex' },
        staticPreview: this.render({ version: '3.14159265' }),
        keywords: ['tex'],
      },
    ]
  }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle({ library }) {
    const json = await this.fetch({ library })
    return renderVersionBadge({ version: json.version.number })
  }
}

module.exports = {
  CtanLicense,
  CtanVersion,
}
