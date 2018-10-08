'use strict'

const BaseJsonService = require('../base-json')
const Joi = require('joi')
const { coveragePercentage } = require('../../lib/color-formatters')
const { NotFound } = require('../errors')

const rangeSchema = Joi.any()

module.exports = class WordpressStatsBase extends BaseJsonService {
  async fetch({ slug }) {
    const url = `https://api.wordpress.org/stats/plugin/1.0/${slug}`
    return this._requestJson({
      url,
      schema: rangeSchema,
    })
  }

  static render({ coverage }) {
    return { message: `${coverage}%`, color: coveragePercentage(coverage) }
  }

  async handle({ slug, tag }) {
    const json = await this.fetch({ slug })

    if (!(tag in json)) {
      throw new NotFound('tag not found')
    }

    return this.constructor.render({ coverage: json[tag] })
  }

  static get category() {
    return 'platform-support'
  }

  static get defaultBadgeData() {
    return { label: 'coverage' }
  }

  static get url() {
    return {
      base: 'wordpress/plugin/stats/',
      format: '(.+)/(.+)',
      capture: ['slug', 'tag'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Wordpress Plugin Stats',
        exampleUrl: 'buddypress/3.2',
        urlPattern: ':slug/:tag',
        staticExample: this.render({ coverage: 80.0 }),
        keywords: ['wordpress'],
      },
    ]
  }
}
