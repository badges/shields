'use strict'

const { metric } = require('../text-formatters')
const LgtmBaseService = require('./lgtm-base')

module.exports = class LgtmAlerts extends LgtmBaseService {
  static get route() {
    return {
      base: 'lgtm/alerts',
      pattern: this.pattern,
    }
  }

  static get examples() {
    return [
      {
        title: 'LGTM Alerts',
        namedParams: {
          host: 'github',
          user: 'apache',
          repo: 'cloudstack',
        },
        staticPreview: this.render({ alerts: 2488 }),
      },
    ]
  }

  static getColor({ alerts }) {
    let color = 'yellow'
    if (alerts === 0) {
      color = 'brightgreen'
    }
    return color
  }

  static render({ alerts }) {
    return {
      message: metric(alerts) + (alerts === 1 ? ' alert' : ' alerts'),
      color: this.getColor({ alerts }),
    }
  }

  async handle({ host, user, repo }) {
    const { alerts } = await this.fetch({ host, user, repo })
    return this.constructor.render({ alerts })
  }
}
