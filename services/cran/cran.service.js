'use strict'

const Joi = require('joi')
const { BaseJsonService } = require('..')
const { renderVersionBadge } = require('../../lib/version')

const schema = Joi.object({
  License: Joi.string().required(),
  Version: Joi.string().required(),
}).required()

class BaseCranService extends BaseJsonService {
  async fetch({ packageName }) {
    const url = `http://crandb.r-pkg.org/${packageName}`
    return this._requestJson({ schema, url })
  }

  static get defaultBadgeData() {
    return { label: 'cran' }
  }
}

class CranLicense extends BaseCranService {
  static get category() {
    return 'license'
  }

  static get route() {
    return {
      base: 'cran/l',
      pattern: ':packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'CRAN/METACRAN',
        namedParams: { packageName: 'devtools' },
        staticPreview: this.render({ license: 'GPL (>= 2)' }),
        keywords: ['R'],
      },
    ]
  }

  static render({ license }) {
    return {
      label: 'license',
      message: license,
      color: 'blue',
    }
  }

  async handle({ packageName }) {
    const data = await this.fetch({ packageName })
    return this.constructor.render({ license: data['License'] })
  }
}

class CranVersion extends BaseCranService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'cran/v',
      pattern: ':packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'CRAN/METACRAN',
        namedParams: { packageName: 'devtools' },
        staticPreview: this.render({ version: '2.0.1' }),
        keywords: ['R'],
      },
    ]
  }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle({ packageName }) {
    const data = await this.fetch({ packageName })
    return this.constructor.render({ version: data['Version'] })
  }
}

module.exports = { CranLicense, CranVersion }
