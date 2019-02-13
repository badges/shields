'use strict'

const Joi = require('joi')
const { BaseJsonService } = require('..')

const bookSummarySchema = Joi.object({
  id: Joi.number().required(),
  page_count_published: Joi.number().required(),
  total_copies_sold: Joi.number().required(),
}).required()

module.exports = class LeanpubBookSummaryService extends BaseJsonService {
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
    return 'funding'
  }

  static get examples() {
    return [
      {
        title: 'Leanpub Book Page Count',
        pattern: 'pages/:book',
        namedParams: {
          book: 'juice-shop',
        },
        staticPreview: this.render({ label: 'pages', message: 226 }),
      },
      {
        title: 'Leanpub Book Total Copies Sold',
        pattern: 'sold/:book',
        namedParams: {
          book: 'juice-shop',
        },
        staticPreview: this.render({ label: 'sold', message: 2691 }),
      },
    ]
  }

  static get route() {
    return {
      base: 'leanpub/book',
      pattern: ':metric(pages|sold)/:book',
    }
  }

  async handle({ metric, book }) {
    // LeanPub API Docs https://leanpub.com/help/api#getting-book-info
    const url = `https://leanpub.com/${book}.json`
    const options = {}
    const errorMessages = {
      404: 'book not found',
    }
    const json = await this._requestJson({
      schema: bookSummarySchema,
      url,
      options,
      errorMessages,
    })

    let value

    if (metric === 'pages') {
      value = json.page_count_published
    } else {
      value = json.total_copies_sold
    }
    return this.constructor.render({ label: metric, message: value })
  }
}
