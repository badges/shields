import Joi from 'joi'
import { optionalUrl } from '../validators.js'
import { BaseService, NotFound } from '../index.js'

const queryParamSchema = Joi.object({
  url: optionalUrl.required(),
  ignoreRedirects: Joi.equal(''),
}).required()

const documentation = `
<p>
  The <a href="https://securityheaders.com/">Security Headers</a>
  provide an easy mechanism to analyze HTTP response headers and
  give information on how to deploy missing headers.
</p>
</p>
  The scan result will be hidden from the public result list and follow redirects will be on too.
<p>
`

export default class SecurityHeaders extends BaseService {
  static category = 'monitoring'

  static route = {
    base: '',
    pattern: 'security-headers',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'Security Headers',
      namedParams: {},
      queryParams: { url: 'https://shields.io' },
      staticPreview: this.render({
        grade: 'A+',
      }),
      documentation,
    },
    {
      title: "Security Headers (Don't follow redirects)",
      namedParams: {},
      queryParams: { url: 'https://www.shields.io', ignoreRedirects: null },
      staticPreview: this.render({
        grade: 'R',
      }),
      documentation,
    },
  ]

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
      url: `https://securityheaders.com`,
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
