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

  static get url() {
    return {
      base: 'uptimerobot/ratio',
      format: '(?:([\\d+])/)?(.*)',
      capture: ['numberOfDays', 'monitorApiKey'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Uptime Robot ratio (30 days)',
        previewUrl: 'm778918918-3e92c097147760ee39d02d36',
      },
      {
        title: 'Uptime Robot ratio (7 days)',
        previewUrl: '7/m778918918-3e92c097147760ee39d02d36',
      },
    ]
  }

  static async render({ ratio }) {
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
