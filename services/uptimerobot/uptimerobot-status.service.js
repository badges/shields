import UptimeRobotBase from './uptimerobot-base.js'

export default class UptimeRobotStatus extends UptimeRobotBase {
  static route = {
    base: 'uptimerobot/status',
    pattern: ':monitorSpecificKey',
  }

  static examples = [
    {
      title: 'Uptime Robot status',
      namedParams: {
        monitorSpecificKey: 'm778918918-3e92c097147760ee39d02d36',
      },
      staticPreview: this.render({ status: 2 }),
    },
  ]

  static defaultBadgeData = {
    label: 'status',
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

  async handle({ monitorSpecificKey }) {
    const { monitors } = await this.fetch({ monitorSpecificKey })
    const { status } = monitors[0]
    return this.constructor.render({ status })
  }
}
