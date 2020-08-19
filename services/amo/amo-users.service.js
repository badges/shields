'use strict'

const { metric } = require('../text-formatters')
const { BaseAmoService, keywords } = require('./amo-base')

module.exports = class AmoUsers extends BaseAmoService {
  static category = 'downloads'
  static route = { base: 'amo/users', pattern: ':addonId' }

  static examples = [
    {
      title: 'Mozilla Add-on',
      namedParams: { addonId: 'dustman' },
      staticPreview: this.render({ users: 750 }),
      keywords,
    },
  ]

  static defaultBadgeData = { label: 'users' }

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
