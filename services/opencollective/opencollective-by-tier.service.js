'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')

// https://developer.opencollective.com/#/api/collectives?id=get-members-per-tier
const membersArraySchema = Joi.array().items(
  Joi.object().keys({
    MemberId: Joi.number().required(),
    tier: Joi.string().required(),
    role: Joi.string().required(),
  })
)

module.exports = class OpencollectiveByTier extends BaseJsonService {
  static get category() {
    return 'funding'
  }

  static get examples() {
    return [
      {
        title: 'open collective members by tier',
        namedParams: { collective: 'shields', tierSlug: 'monthly-backer' },
        staticExample: this.render('shields', 'monthly-backer', 8),
      },
    ]
  }

  static get route() {
    return {
      base: 'opencollective/tier',
      pattern: ':collective/:tierSlug',
    }
  }

  static render(collective, tierSlug, membersCount) {
    return {
      label: tierSlug.endsWith('s') ? tierSlug : `${tierSlug}s`,
      message: membersCount,
      color: membersCount > 0 ? 'brightgreen' : 'lightgrey',
      //links: [`https://opencollective.com/${collective}`]
    }
  }

  async handle({ collective, tierSlug }) {
    const sponsorsCount = await this.fetch(collective, tierSlug)
    return this.constructor.render(collective, tierSlug, sponsorsCount)
  }

  async fetch(collective, tierSlug) {
    const members = await this._requestJson({
      schema: membersArraySchema,
      url: `https://opencollective.com/${collective}/tiers/${tierSlug}/all.json`,
    })
    return members.length
  }
}
