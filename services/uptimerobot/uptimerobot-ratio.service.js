'use strict'

const { colorScale } = require('../../lib/color-formatters')
const UptimeRobotBase = require('./uptimerobot-base')

const ratioColor = colorScale([10, 30, 50, 70])

module.exports = class UptimeRobotRatio extends UptimeRobotBase {
  static get defaultBadgeData() {
    return {
      label: 'uptime',
    }
  }

  static get route() {
    return {
      base: 'uptimerobot/ratio',
      pattern: ':numberOfDays(\\d+)?/:monitorApiKey',
    }
  }

  static get examples() {
    return [
      {
        title: 'Uptime Robot ratio (30 days)',
        exampleUrl: 'm778918918-3e92c097147760ee39d02d36',
        pattern: ':monitor-specific-key',
        staticExample: this.render({ ratio: 100 }),
      },
      {
        title: 'Uptime Robot ratio (7 days)',
        exampleUrl: '7/m778918918-3e92c097147760ee39d02d36',
        pattern: '7/:monitor-specific-key',
        staticExample: this.render({ ratio: 100 }),
      },
    ]
  }

  static render({ ratio }) {
    return {
      message: `${ratio}%`,
      color: ratioColor(ratio),
    }
  }

  async handle({ numberOfDays = 30, monitorApiKey }) {
    const { monitors } = await this.fetch({ monitorApiKey, numberOfDays })
    const ratio = Number.parseFloat(monitors[0].custom_uptime_ratio)
    return this.constructor.render({ ratio })
  }
}
