import { metric } from '../text-formatters.js'
import LgtmBaseService from './lgtm-base.js'

export default class LgtmAlerts extends LgtmBaseService {
  static route = {
    base: 'lgtm/alerts',
    pattern: this.pattern,
  }

  static examples = [
    {
      title: 'LGTM Alerts',
      namedParams: {
        host: 'github',
        user: 'apache',
        repo: 'cloudstack',
      },
      staticPreview: this.render({ alerts: 2488 }),
    },
  ]

  static defaultBadgeData = {
    label: 'lgtm alerts',
  }

  static getColor({ alerts }) {
    let color = 'yellow'
    if (alerts === 0) {
      color = 'brightgreen'
    }
    return color
  }

  static render({ alerts }) {
    return {
      message: metric(alerts),
      color: this.getColor({ alerts }),
    }
  }

  async handle({ host, user, repo }) {
    const { alerts } = await this.fetch({ host, user, repo })
    return this.constructor.render({ alerts })
  }
}
