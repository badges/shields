'use strict'

const Joi = require('joi')
const { renderVersionBadge } = require('../../lib/version')
const { BaseJsonService, NotFound } = require('..')
const { nonNegativeInteger } = require('../validators')

const schema = Joi.object({
  resultCount: nonNegativeInteger,
  results: Joi.array()
    .items(Joi.object({ version: Joi.string().required() }))
    .min(0),
}).required()

module.exports = class Itunes extends BaseJsonService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'itunes/v',
      pattern: ':bundleId',
    }
  }

  static get defaultBadgeData() {
    return { label: 'itunes app store' }
  }

  static get examples() {
    return [
      {
        title: 'iTunes App Store',
        namedParams: { bundleId: '803453959' },
        staticPreview: renderVersionBadge({ version: 'v3.3.3' }),
      },
    ]
  }

  async fetch({ bundleId }) {
    return this._requestJson({
      schema,
      url: `https://itunes.apple.com/lookup?id=${bundleId}`,
    })
  }

  async handle({ bundleId }) {
    const data = await this.fetch({ bundleId })

    if (data.resultCount === 0) {
      // Note the 'not found' response from iTunes is:
      // status code = 200,
      // body = { "resultCount":0, "results": [] }
      throw new NotFound()
    }

    return renderVersionBadge({ version: data.results[0].version })
  }
}
