'use strict'

const Joi = require('@hapi/joi')
const { renderVersionBadge } = require('../version')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  versions: Joi.object({
    stable: Joi.string().required(),
  }).required(),
}).required()

module.exports = class Homebrew extends BaseJsonService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'homebrew/v',
      pattern: ':formula',
    }
  }

  static get examples() {
    return [
      {
        title: 'homebrew',
        namedParams: { formula: 'cake' },
        staticPreview: renderVersionBadge({ version: 'v0.32.0' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'homebrew' }
  }

  async fetch({ formula }) {
    return this._requestJson({
      schema,
      url: `https://formulae.brew.sh/api/formula/${formula}.json`,
    })
  }

  async handle({ formula }) {
    const data = await this.fetch({ formula })
    return renderVersionBadge({ version: data.versions.stable })
  }
}
