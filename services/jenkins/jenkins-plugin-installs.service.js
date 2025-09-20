import Joi from 'joi'
import { renderDownloadsBadge } from '../downloads.js'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService, pathParams } from '../index.js'

const schemaInstallations = Joi.object()
  .keys({
    installations: Joi.object()
      .required()
      .pattern(nonNegativeInteger, nonNegativeInteger)
      .min(1),
  })
  .required()

export default class JenkinsPluginInstalls extends BaseJsonService {
  static category = 'downloads'

  static route = {
    base: 'jenkins/plugin/i',
    pattern: ':plugin/:version?',
  }

  static openApi = {
    '/jenkins/plugin/i/{plugin}': {
      get: {
        summary: 'Jenkins Plugin installs',
        parameters: pathParams({
          name: 'plugin',
          example: 'view-job-filters',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'installs' }

  static render({ installs: downloads }) {
    return renderDownloadsBadge({ downloads })
  }

  async fetch({ plugin }) {
    return this._requestJson({
      url: `https://stats.jenkins.io/plugin-installation-trend/${plugin}.stats.json`,
      schema: schemaInstallations,
      httpErrors: {
        404: 'plugin not found',
      },
    })
  }

  static transform({ json }) {
    const latestDate = Object.keys(json.installations).sort().slice(-1)[0]
    return { installs: json.installations[latestDate] }
  }

  async handle({ plugin, version }) {
    if (version) {
      return {
        message: 'no longer available per version',
        color: 'lightgrey',
      }
    }
    const json = await this.fetch({ plugin })
    const { installs } = this.constructor.transform({ json })
    return this.constructor.render({ installs })
  }
}
