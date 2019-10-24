'use strict'

const Joi = require('@hapi/joi')
const { renderVersionBadge } = require('../version')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  version: Joi.string().required(),
}).required()

module.exports = class HomebrewCask extends BaseJsonService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'homebrew/cask/v',
      pattern: ':formula',
    }
  }

  static get examples() {
    return [
      {
        title: 'homebrew cask',
        namedParams: { formula: 'iterm2' },
        staticPreview: renderVersionBadge({ version: 'v3.2.5' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'homebrew cask' }
  }

  async fetch({ formula }) {
    return this._requestJson({
      schema,
      url: `https://formulae.brew.sh/api/cask/${formula}.json`,
    })
  }

  async handle({ formula }) {
    const data = await this.fetch({ formula })
    return renderVersionBadge({ version: data.version })
  }
}
