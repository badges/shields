'use strict'

const Joi = require('@hapi/joi')
const { renderVersionBadge } = require('../version')
const { BaseJsonService } = require('..')

const schema = Joi.object({ version: Joi.string().required() }).required()

module.exports = class Cookbook extends BaseJsonService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'cookbook/v',
      pattern: ':cookbook',
    }
  }

  static get examples() {
    return [
      {
        title: 'Chef cookbook',
        namedParams: { cookbook: 'chef-sugar' },
        staticPreview: renderVersionBadge({ version: '5.0.0' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'cookbook' }
  }

  async fetch({ cookbook }) {
    const url = `https://supermarket.getchef.com/api/v1/cookbooks/${cookbook}/versions/latest`
    return this._requestJson({ schema, url })
  }

  async handle({ cookbook }) {
    const { version } = await this.fetch({ cookbook })
    return renderVersionBadge({ version })
  }
}
