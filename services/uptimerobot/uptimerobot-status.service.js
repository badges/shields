import { pathParams } from '../index.js'
import { queryParamSchema } from '../website-status.js'
import UptimeRobotBase from './uptimerobot-base.js'

export default class UptimeRobotStatus extends UptimeRobotBase {
  static route = {
    base: 'uptimerobot/status',
    pattern: ':monitorSpecificKey',
    queryParamSchema,
  }

  static openApi = {
    '/uptimerobot/status/{monitorSpecificKey}': {
      get: {
        summary: 'Uptime Robot status',
        parameters: pathParams({
          name: 'monitorSpecificKey',
          example: 'm778918918-3e92c097147760ee39d02d36',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'status',
  }

  static render({ status, upMessage = 'up', downMessage = 'down' }) {
    switch (status) {
      case 0:
        return { message: 'paused', color: 'yellow' }
      case 1:
        return { message: 'not checked yet', color: 'yellowgreen' }
      case 2:
        return { message: upMessage, color: 'brightgreen' }
      case 8:
        return { message: 'seems down', color: 'orange' }
      case 9:
        return { message: downMessage, color: 'red' }
      default:
        throw Error('Should not get here due to validation')
    }
  }

  async handle(
    { monitorSpecificKey },
    { up_message: upMessage, down_message: downMessage },
  ) {
    const { monitors } = await this.fetch({ monitorSpecificKey })
    const { status } = monitors[0]
    return this.constructor.render({ status, upMessage, downMessage })
  }
}
