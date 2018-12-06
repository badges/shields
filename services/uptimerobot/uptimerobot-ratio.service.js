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
      pattern: ':numberOfDays(\\d+)?/:monitorSpecificKey',
    }
  }

  static get examples() {
    return [
      {
        title: 'Uptime Robot ratio (30 days)',
        pattern: ':monitorSpecificKey',
        namedParams: {
          monitorSpecificKey: 'm778918918-3e92c097147760ee39d02d36',
        },
        staticExample: this.render({ ratio: 100 }),
      },
      {
        title: 'Uptime Robot ratio (7 days)',
        pattern: '7/:monitorSpecificKey',
        namedParams: {
          monitorSpecificKey: 'm778918918-3e92c097147760ee39d02d36',
        },
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

  async handle({ numberOfDays = 30, monitorSpecificKey }) {
    const { monitors } = await this.fetch({ monitorSpecificKey, numberOfDays })
    const ratio = Number.parseFloat(monitors[0].custom_uptime_ratio)
    return this.constructor.render({ ratio })
  }
}
