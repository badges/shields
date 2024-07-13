import { pathParam } from '../index.js'
import { queryParamSchema, queryParams } from '../website-status.js'
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
        parameters: [
          pathParam({
            name: 'monitorSpecificKey',
            example: 'm778918918-3e92c097147760ee39d02d36',
          }),
          ...queryParams,
        ],
      },
    },
  }

  static defaultBadgeData = {
    label: 'status',
  }

  static render({
    status,
    upMessage = 'up',
    downMessage = 'down',
    upColor = 'brightgreen',
    downColor = 'red',
  }) {
    switch (status) {
      case 0:
        return { message: 'paused', color: 'yellow' }
      case 1:
        return { message: 'not checked yet', color: 'yellowgreen' }
      case 2:
        return { message: upMessage, color: upColor }
      case 8:
        return { message: 'seems down', color: 'orange' }
      case 9:
        return { message: downMessage, color: downColor }
      default:
        throw Error('Should not get here due to validation')
    }
  }

  async handle(
    { monitorSpecificKey },
    {
      up_message: upMessage,
      down_message: downMessage,
      up_color: upColor,
      down_color: downColor,
    },
  ) {
    const { monitors } = await this.fetch({ monitorSpecificKey })
    const { status } = monitors[0]
    return this.constructor.render({
      status,
      upMessage,
      downMessage,
      upColor,
      downColor,
    })
  }
}
