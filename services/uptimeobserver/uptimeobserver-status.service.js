import { pathParam } from '../index.js'
import { queryParamSchema, queryParams } from '../website-status.js'
import UptimeObserverBase from './uptimeobserver-base.js'

export default class UptimeObserverStatus extends UptimeObserverBase {
  static route = {
    base: 'uptimeobserver/status',
    pattern: ':monitorKey',
    queryParamSchema,
  }

  static openApi = {
    '/uptimeobserver/status/{monitorKey}': {
      get: {
        summary: 'UptimeObserver status',
        parameters: [
          pathParam({
            name: 'monitorKey',
            example: 'your-monitor-key-here',
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
    // Based on the API response, status values are strings like "UP", "DOWN", etc.
    switch (status.toUpperCase()) {
      case 'UP':
        return { message: upMessage, color: upColor }
      case 'DOWN':
        return { message: downMessage, color: downColor }
      case 'PAUSED':
        return { message: 'paused', color: 'lightgrey' }
      default:
        return { message: status.toLowerCase(), color: 'lightgrey' }
    }
  }

  async handle(
    { monitorKey },
    {
      up_message: upMessage,
      down_message: downMessage,
      up_color: upColor,
      down_color: downColor,
    },
  ) {
    const response = await this.fetch({ monitorKey })
    const { status } = response

    return this.constructor.render({
      status,
      upMessage,
      downMessage,
      upColor,
      downColor,
    })
  }
}
