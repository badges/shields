'use strict'

const Joi = require('joi')
const { metric } = require('../text-formatters')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  query: Joi.object({
    results: Joi.object()
      .required()
      .pattern(/^.+:.+$/, {
        printouts: Joi.object({
          'Has website count': Joi.array()
            .required()
            .items(Joi.number().required()),
        }).required(),
      }),
  }).required(),
}).required()

/**
 * This badge displays the total usages of a MediaWiki extensions via
 * Wikiapiary.
 *
 * {@link https://www.mediawiki.org/wiki/Manual:Extensions MediaWiki Extensions Manual}
 */
module.exports = class WikiapiaryExtension extends BaseJsonService {
  static category = 'downloads'
  static route = {
    base: 'wikiapiary/extensions',
    pattern: ':type/:extension',
  }

  static examples = [
    {
      title: 'Wikiapiary extension usage',
      namedParams: { type: 'Extension', extension: 'ParserFunctions' },
      staticPreview: this.render({ usage: 11170 }),
      keywords: ['mediawiki'],
    },
  ]

  static defaultBadgeData = { label: 'usage', color: 'informational' }

  static render({ usage }) {
    return { message: metric(usage) }
  }

  async fetch({ type, extension }) {
    return this._requestJson({
      schema,
      url: `https://wikiapiary.com/w/api.php?action=ask&query=[[${type}:${extension}]]|?Has_website_count&format=json`,
    })
  }

  async handle({ type, extension }) {
    const response = await this.fetch({ type, extension })
    const [usage] =
      response.query.results[`${type}:${extension}`].printouts[
        'Has website count'
      ]
    return this.constructor.render({ usage })
  }
}
