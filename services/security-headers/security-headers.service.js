import Joi from 'joi'
import { url } from '../validators.js'
import { BaseService, NotFound, queryParams } from '../index.js'

const queryParamSchema = Joi.object({
  url,
  ignoreRedirects: Joi.equal(''),
}).required()

const description = `
The [Security Headers](https://securityheaders.com/)
provide an easy mechanism to analyze HTTP response headers and
give information on how to deploy missing headers.

The scan result will be hidden from the public result list and follow redirects will be on too.
`

export default class SecurityHeaders extends BaseService {
  static category = 'monitoring'

  static route = {
    base: '',
    pattern: 'security-headers',
    queryParamSchema,
  }

  static openApi = {
    '/security-headers': {
      get: {
        summary: 'Security Headers',
        description,
        parameters: queryParams(
          { name: 'url', example: 'https://shields.io', required: true },
          {
            name: 'ignoreRedirects',
            schema: { type: 'boolean' },
            example: null,
          },
        ),
      },
    },
  }

  static defaultBadgeData = {
    label: 'security headers',
  }

  static render({ grade }) {
    const colorMap = {
      'A+': 'brightgreen',
      A: 'green',
      B: 'yellow',
      C: 'yellow',
      D: 'orange',
      E: 'orange',
      F: 'red',
      R: 'blue',
    }

    return {
      message: grade,
      color: colorMap[grade],
    }
  }

  async handle(namedParams, { url, ignoreRedirects }) {
    const { res } = await this._request({
      url: 'https://securityheaders.com',
      options: {
        method: 'HEAD',
        searchParams: {
          q: url,
          hide: 'on',
          followRedirects: ignoreRedirects !== undefined ? null : 'on',
        },
      },
    })

    const grade = res.headers['x-grade']

    if (!grade) {
      throw new NotFound({ prettyMessage: 'not available' })
    }

    return this.constructor.render({ grade })
  }
}
