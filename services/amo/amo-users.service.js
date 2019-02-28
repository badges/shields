'use strict'

const { metric } = require('../text-formatters')
const { BaseAmoService, keywords } = require('./amo-base')

module.exports = class AmoUsers extends BaseAmoService {
  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'amo/users',
      pattern: ':addonId',
    }
  }

  static get examples() {
    return [
      {
        title: 'Mozilla Add-on',
        namedParams: { addonId: 'dustman' },
        staticPreview: this.render({ users: 750 }),
        keywords,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'users',
    }
  }

  static render({ users }) {
    return {
      message: metric(users),
      color: 'blue',
    }
  }

  async handle({ addonId }) {
    const data = await this.fetch({ addonId })
    return this.constructor.render({ users: data.average_daily_users })
  }
}
