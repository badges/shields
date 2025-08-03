import { pathParams } from '../index.js'
import { colorScale } from '../color-formatters.js'
import UptimeObserverBase from './uptimeobserver-base.js'

const ratioColor = colorScale([10, 30, 50, 70])

export default class UptimeObserverRatio extends UptimeObserverBase {
  static route = {
    base: 'uptimeobserver/ratio',
    pattern: ':period(\\d+)?/:monitorKey',
  }

  static openApi = {
    '/uptimeobserver/ratio/1/{monitorKey}': {
      get: {
        summary: 'UptimeObserver uptime ratio (1 day)',
        parameters: pathParams({
          name: 'monitorKey',
          example: '33Zw1rnH6veb4OLcskqvj6g9Lj4tnyxZ41',
        }),
      },
    },
    '/uptimeobserver/ratio/7/{monitorKey}': {
      get: {
        summary: 'UptimeObserver uptime ratio (7 days)',
        parameters: pathParams({
          name: 'monitorKey',
          example: '33Zw1rnH6veb4OLcskqvj6g9Lj4tnyxZ41',
        }),
      },
    },
    '/uptimeobserver/ratio/30/{monitorKey}': {
      get: {
        summary: 'UptimeObserver uptime ratio (30 days)',
        parameters: pathParams({
          name: 'monitorKey',
          example: '33Zw1rnH6veb4OLcskqvj6g9Lj4tnyxZ41',
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

  async handle({ period = '30', monitorKey }) {
    const response = await this.fetch({ monitorKey })

    let uptimeField
    switch (period) {
      case '1':
        uptimeField = 'uptime24h'
        break
      case '7':
        uptimeField = 'uptime7d'
        break
      case '30':
      default:
        uptimeField = 'uptime30d'
        break
    }

    const ratio = response[uptimeField]

    return this.constructor.render({ ratio })
  }
}
