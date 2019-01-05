'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')

// https://developer.opencollective.com/#/api/collectives?id=get-members
const membersArraySchema = Joi.array().items(
  Joi.object().keys({
    MemberId: Joi.number().required(),
    type: 'ORGANIZATION',
    role: Joi.string().required(),
  })
)

module.exports = class OpencollectiveSponsors extends BaseJsonService {
  static get category() {
    return 'funding'
  }

  static get examples() {
    return [
      {
        title: 'open collective sponsors',
        namedParams: { collective: 'shields' },
        staticExample: this.render('shields', 10),
        keywords: ['opencollective'],
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'sponsors',
    }
  }

  static get route() {
    return {
      base: 'opencollective/sponsors',
      pattern: ':collective',
    }
  }

  static render(collective, sponsorsCount) {
    return {
      message: sponsorsCount,
      color: sponsorsCount > 0 ? 'brightgreen' : 'lightgrey',
      //links: [`https://opencollective.com/${collective}`]
    }
  }

  async handle({ collective }) {
    const sponsorsCount = await this.fetch(collective)
    return this.constructor.render(collective, sponsorsCount)
  }

  async fetch(collective) {
    const members = await this._requestJson({
      schema: membersArraySchema,
      url: `https://opencollective.com/${collective}/members/organizations.json`,
    })
    return members.filter(member => member.role === 'BACKER').length
  }
}
