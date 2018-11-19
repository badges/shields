'use strict'

const UptimeRobotBase = require('./uptimerobot-base')

module.exports = class UptimeRobotStatus extends UptimeRobotBase {
  static get defaultBadgeData() {
    return {
      label: 'status',
    }
  }

  static get route() {
    return {
      base: 'uptimerobot/status',
      pattern: ':monitorApiKey',
    }
  }

  static get examples() {
    return [
      {
        title: 'Uptime Robot status',
        exampleUrl: 'm778918918-3e92c097147760ee39d02d36',
        pattern: ':monitor-specific-key',
        staticExample: this.render({ status: 2 }),
      },
    ]
  }

  static render({ status }) {
    switch (status) {
      case 0:
        return { message: 'paused', color: 'yellow' }
      case 1:
        return { message: 'not checked yet', color: 'yellowgreen' }
      case 2:
        return { message: 'up', color: 'brightgreen' }
      case 8:
        return { message: 'seems down', color: 'orange' }
      case 9:
        return { message: 'down', color: 'red' }
      default:
        throw Error('Should not get here due to validation')
    }
  }

  async handle({ monitorApiKey }) {
    const { monitors } = await this.fetch({ monitorApiKey })
    const { status } = monitors[0]
    return this.constructor.render({ status })
  }
}
