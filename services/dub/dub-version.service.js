'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')
const { renderVersionBadge } = require('../../lib/version')

const schema = Joi.string().required()

module.exports = class DubVersion extends BaseJsonService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'dub/v',
      pattern: ':packageName',
    }
  }

  static get defaultBadgeData() {
    return { label: 'dub' }
  }

  static get examples() {
    return [
      {
        title: 'DUB',
        namedParams: { packageName: 'vibe-d' },
        staticPreview: renderVersionBadge({ version: 'v0.8.4' }),
      },
    ]
  }

  async fetch({ packageName }) {
    return this._requestJson({
      schema,
      url: `https://code.dlang.org/api/packages/${packageName}/latest`,
    })
  }

  async handle({ packageName }) {
    const version = await this.fetch({ packageName })
    return renderVersionBadge({ version })
  }
}
