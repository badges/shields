import Joi from 'joi'
import { BaseJsonService, pathParams } from '../index.js'

const schema = Joi.object({
  schemaVersion: Joi.number().required(),
  label: Joi.string().required(),
  message: Joi.string().required(),
  color: Joi.string().required(),
  isError: Joi.boolean(),
}).required()

export default class BrowserCalendar extends BaseJsonService {
  static category = 'platform-support'

  static route = {
    base: 'browsercalendar',
    pattern: ':browser(chrome|firefox|edge|safari)/:version',
  }

  static openApi = {
    '/browsercalendar/{browser}/{version}': {
      get: {
        summary: 'Browser Calendar Version Compatibility',
        description:
          '[Browser Calendar](https://browsercalendar.com) provides real-time browser version tracking. Use this badge to show compatibility with specific browser versions using semver requirements.',
        parameters: pathParams(
          {
            name: 'browser',
            example: 'chrome',
            description: 'Browser name',
            schema: {
              type: 'string',
              enum: ['chrome', 'firefox', 'edge', 'safari'],
            },
          },
          {
            name: 'version',
            example: '<=150.0.0',
            description:
              'Semver version requirement (e.g., <=150.0.0, >=130.0.0, ^140.0.0)',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'browser' }

  async fetch({ browser, version }) {
    return this._requestJson({
      schema,
      url: 'https://browsercalendar.com/api/shields',
      options: {
        searchParams: { [browser]: version },
      },
      httpErrors: {
        400: 'invalid version format',
        404: 'browser not found',
      },
    })
  }

  async handle({ browser, version }) {
    const { label, message, color } = await this.fetch({ browser, version })
    return { label, message, color }
  }
}
