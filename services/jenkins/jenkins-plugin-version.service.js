import { getCachedResource } from '../../core/base-service/resource-cache.js'
import { renderVersionBadge } from '../version.js'
import { BaseService, NotFound, pathParams } from '../index.js'

export default class JenkinsPluginVersion extends BaseService {
  static category = 'version'

  static route = {
    base: 'jenkins/plugin/v',
    pattern: ':plugin',
  }

  static openApi = {
    '/jenkins/plugin/v/{plugin}': {
      get: {
        summary: 'Jenkins Plugin Version',
        parameters: pathParams({
          name: 'plugin',
          example: 'blueocean',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'plugin' }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async fetch() {
    return getCachedResource({
      url: 'https://updates.jenkins-ci.org/current/update-center.actual.json',
      ttl: 4 * 3600 * 1000, // 4 hours in milliseconds
      scraper: json =>
        Object.keys(json.plugins).reduce((previous, current) => {
          previous[current] = json.plugins[current].version
          return previous
        }, {}),
    })
  }

  async handle({ plugin }) {
    const versions = await this.fetch()
    const version = versions[plugin]
    if (version === undefined) {
      throw new NotFound({ prettyMessage: 'plugin not found' })
    }
    return this.constructor.render({ version })
  }
}
