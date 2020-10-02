'use strict'

const Joi = require('joi')
const { renderVersionBadge } = require('../version')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  version: Joi.string().required(),
}).required()

module.exports = class HomebrewCask extends BaseJsonService {
  static category = 'version'
  static route = { base: 'homebrew/cask/v', pattern: ':cask' }

  static examples = [
    {
      title: 'homebrew cask',
      namedParams: { cask: 'iterm2' },
      staticPreview: renderVersionBadge({ version: 'v3.2.5' }),
    },
  ]

  static defaultBadgeData = { label: 'homebrew cask' }

  async fetch({ cask }) {
    return this._requestJson({
      schema,
      url: `https://formulae.brew.sh/api/cask/${cask}.json`,
    })
  }

  async handle({ cask }) {
    const data = await this.fetch({ cask })
    return renderVersionBadge({ version: data.version })
  }
}
