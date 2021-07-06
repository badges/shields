'use strict'

const Joi = require('joi')
const { metric } = require('../text-formatters')
const { BaseJsonService, NotFound } = require('..')

const schema = Joi.object({
  query: Joi.object({
    results: Joi.alternatives([
      Joi.object()
        .required()
        .pattern(/^\w+:.+$/, {
          printouts: Joi.object({
            'Has website count': Joi.array()
              .required()
              .items(Joi.number().required()),
          }).required(),
        }),
      Joi.array().required(),
    ]).required(),
  }).required(),
}).required()

/**
 * This badge displays the total installations of a MediaWiki extensions, skins,
 * etc via Wikiapiary.
 *
 * {@link https://www.mediawiki.org/wiki/Manual:Extensions MediaWiki Extensions Manual}
 */
module.exports = class WikiapiaryInstalls extends BaseJsonService {
  static category = 'downloads'
  static route = {
    base: 'wikiapiary',
    pattern: ':variant(Extension|Skin|Farm|Generator|Host)/installs/:name',
  }

  static examples = [
    {
      title: 'Wikiapiary installs',
      namedParams: { variant: 'Extension', name: 'ParserFunctions' },
      staticPreview: this.render({ usage: 11170 }),
      keywords: ['mediawiki'],
    },
  ]

  static defaultBadgeData = { label: 'installs', color: 'informational' }

  static render({ usage }) {
    return { message: metric(usage) }
  }

  static validate({ results }) {
    if (Array.isArray(results))
      throw new NotFound({ prettyMessage: 'not found' })
  }

  async fetch({ variant, name }) {
    return this._requestJson({
      schema,
      url: `https://wikiapiary.com/w/api.php?action=ask&query=[[${variant}:${name}]]|?Has_website_count&format=json`,
    })
  }

  async handle({ variant, name }) {
    const response = await this.fetch({ variant, name })
    const { results } = response.query

    this.constructor.validate({ results })

    const [usage] = results[`${variant}:${name}`].printouts['Has website count']
    return this.constructor.render({ usage })
  }
}
