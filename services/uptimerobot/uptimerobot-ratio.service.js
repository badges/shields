import { pathParams } from '../index.js'
import { colorScale } from '../color-formatters.js'
import UptimeRobotBase from './uptimerobot-base.js'

const ratioColor = colorScale([10, 30, 50, 70])

export default class UptimeRobotRatio extends UptimeRobotBase {
  static route = {
    base: 'uptimerobot/ratio',
    pattern: ':numberOfDays(\\d+)?/:monitorSpecificKey',
  }

  static openApi = {
    '/uptimerobot/ratio/{monitorSpecificKey}': {
      get: {
        summary: 'Uptime Robot ratio (30 days)',
        parameters: pathParams({
          name: 'monitorSpecificKey',
          example: 'm778918918-3e92c097147760ee39d02d36',
        }),
      },
    },
    '/uptimerobot/ratio/7/{monitorSpecificKey}': {
      get: {
        summary: 'Uptime Robot ratio (7 days)',
        parameters: pathParams({
          name: 'monitorSpecificKey',
          example: 'm778918918-3e92c097147760ee39d02d36',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'uptime',
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
