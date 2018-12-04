'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')
const serverSecrets = require('../../lib/server-secrets')

const bookSummarySchema = Joi.object({
  id: Joi.number().required(),
  page_count_published: Joi.number().required(),
  total_copies_sold: Joi.number().required(),
  total_revenue: Joi.number(),
}).required()

const keywords = ['leanpub']

module.exports = class LeanPubBookSummaryService extends BaseJsonService {
  static render({ label, message }) {
    return {
      label,
      message,
    }
  }

  static get defaultBadgeData() {
    return { color: 'blue', label: 'leanpub' }
  }

  static get category() {
    return 'other'
  }

  static get examples() {
    return [
      {
        title: 'LeanPub Book Page Count',
        pattern: ':book/:metric',
        namedParams: {
          book: 'juice-shop',
          metric: 'pages',
        },
        staticExample: this.render({ label: 'pages', message: 226 }),
        keywords,
      },
      {
        title: 'LeanPub Book Total Copies Sold',
        pattern: ':book/:metric',
        namedParams: {
          book: 'juice-shop',
          metric: 'sold',
        },
        staticExample: this.render({ label: 'sold', message: 2691 }),
        keywords,
      },
      {
        title: 'LeanPub Book Total Revenue',
        pattern: ':book/:metric',
        namedParams: {
          book: 'juice-shop',
          metric: 'revenue',
        },
        staticExample: this.render({ label: 'revenue', message: 1123334.14 }),
        keywords,
      },
    ]
  }

  static get route() {
    return {
      base: 'leanpub/book/summary',
      format: '([^/]+)/(pages|sold|revenue)',
      capture: ['book', 'metric'],
    }
  }

  getOptions() {
    const options = {}
    if (serverSecrets && serverSecrets.leanpub_token) {
      options.qs = {
        api_key: serverSecrets.leanpub_token,
      }
    }
    return options
  }

  async handle({ book, metric }) {
    // LeanPub API Docs https://leanpub.com/help/api#getting-book-info
    const url = `https://leanpub.com/${book}.json`
    const options = this.getOptions()
    const errorMessages = {
      404: 'book not found',
    }
    const json = await this._requestJson({
      schema: bookSummarySchema,
      url,
      options,
      errorMessages,
    })

    let label, value

    if (metric === 'pages') {
      label = 'pages'
      value = json.page_count_published
    } else if (metric === 'sold') {
      label = 'sold'
      value = json.total_copies_sold
    } else if (metric === 'revenue') {
      label = 'revenue'
      value = json.total_revenue
    }
    return this.constructor.render({ label, message: value })
  }
}
