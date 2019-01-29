'use strict'

const LgtmBaseService = require('./lgtm-base')
const { metric } = require('../../lib/text-formatters')

module.exports = class LgtmAlerts extends LgtmBaseService {
  static get route() {
    return {
      base: 'lgtm/alerts/g',
      pattern: ':user/:repo',
    }
  }

  async handle({ user, repo }) {
    const { alerts } = await this.fetch({ user, repo })
    return this.constructor.render({ alerts })
  }

  static render({ alerts }) {
    return {
      message: metric(alerts) + (alerts === 1 ? ' alert' : ' alerts'),
      color: this.getColor({ alerts }),
    }
  }

  static getColor({ alerts }) {
    let color = 'yellow'
    if (alerts === 0) {
      color = 'brightgreen'
    }
    return color
  }

  static get examples() {
    return [
      {
        title: 'LGTM Alerts',
        namedParams: {
          user: 'apache',
          repo: 'cloudstack',
        },
        staticPreview: this.render({ alerts: 2488 }),
      },
    ]
  }
}
