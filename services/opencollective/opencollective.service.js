'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')
const { nonNegativeInteger } = require('../validators')

// https://developer.opencollective.com/#/api/collectives?id=get-info
const collectiveDetailsSchema = Joi.object().keys({
  slug: Joi.string().required(),
  backersCount: nonNegativeInteger,
})

module.exports = class Opencollective extends BaseJsonService {
  static get category() {
    return 'funding'
  }

  static get examples() {
    return [
      {
        title: 'open collective backers and sponsors',
        namedParams: { collective: 'shields' },
        staticExample: this.render('shields', 35),
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'backers and sponsors',
    }
  }

  static get route() {
    return {
      base: 'opencollective',
      pattern: ':collective',
    }
  }

  static render(collective, totalBackersCount) {
    return {
      message: totalBackersCount,
      color: totalBackersCount > 0 ? 'brightgreen' : 'lightgrey',
      //links: [`https://opencollective.com/${collective}`]
    }
  }

  async handle({ collective }) {
    const totalBackersCount = await this.fetch(collective)
    return this.constructor.render(collective, totalBackersCount)
  }

  async fetch(collective) {
    const { backersCount } = await this._requestJson({
      schema: collectiveDetailsSchema,
      url: `https://opencollective.com/${collective}.json`,
    })
    return backersCount
  }
}
