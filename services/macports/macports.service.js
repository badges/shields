/**
 * MacPorts port version badge.
 *
 * API endpoint: GET https://ports.macports.org/api/v1/ports/{port-name}/
 * Rate limits: not documented in the official API documentation.
 * Auth requirements: none; all endpoints are open and do not require authentication.
 *
 * @see https://github.com/macports/macports-webapp/blob/main/docs/API_v1/ENDPOINTS.md
 */

import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService, pathParams } from '../index.js'

const schema = Joi.object({
  version: Joi.string().required(),
}).required()

const description = `
Shows the version of a MacPorts package from the [MacPorts webapp API](https://ports.macports.org/api/v1/).

The MacPorts API v1 only supports \`GET\` requests, does not require
authentication, and does not document request rate limits. See the
[API endpoints documentation](https://github.com/macports/macports-webapp/blob/main/docs/API_v1/ENDPOINTS.md).
`

export default class Macports extends BaseJsonService {
  static category = 'version'

  static apiBaseUrl = 'https://ports.macports.org/api/v1'

  static route = {
    base: 'macports/v',
    pattern: ':packageName',
  }

  static openApi = {
    '/macports/v/{packageName}': {
      get: {
        summary: 'MacPorts Package Version',
        description,
        parameters: pathParams({
          name: 'packageName',
          example: 'git',
          description:
            'MacPorts port name, e.g. `git` or `proxy-audio-device`.',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'macports',
  }

  static portUrl({ packageName }) {
    return `${Macports.apiBaseUrl}/ports/${encodeURIComponent(packageName)}/`
  }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async fetch({ packageName }) {
    return this._requestJson({
      schema,
      url: this.constructor.portUrl({ packageName }),
    })
  }

  async handle({ packageName }) {
    const data = await this.fetch({ packageName })
    return this.constructor.render({ version: data.version })
  }
}
