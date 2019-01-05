'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')

// https://developer.opencollective.com/#/api/collectives?id=get-members
const membersArraySchema = Joi.array().items(
  Joi.object().keys({
    MemberId: Joi.number().required(),
    type: 'USER',
    role: Joi.string().required(),
  })
)

module.exports = class OpencollectiveBackers extends BaseJsonService {
  static get category() {
    return 'funding'
  }

  static get examples() {
    return [
      {
        title: 'open collective backers',
        namedParams: { collective: 'shields' },
        staticExample: this.render('shields', 25),
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'backers',
    }
  }

  static get route() {
    return {
      base: 'opencollective/backers',
      pattern: ':collective',
    }
  }

  static render(collective, backersCount) {
    return {
      message: backersCount,
      color: backersCount > 0 ? 'brightgreen' : 'lightgrey',
      //links: [`https://opencollective.com/${collective}`]
    }
  }

  async handle({ collective }) {
    const backersCount = await this.fetch(collective)
    return this.constructor.render(collective, backersCount)
  }

  async fetch(collective) {
    const members = await this._requestJson({
      schema: membersArraySchema,
      url: `https://opencollective.com/${collective}/members/users.json`,
    })
    return members.filter(member => member.role === 'BACKER').length
  }
}
