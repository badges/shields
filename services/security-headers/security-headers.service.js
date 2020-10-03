'use strict'

const Joi = require('joi')
const { optionalUrl } = require('../validators')
const { BaseService, NotFound } = require('..')

const queryParamSchema = Joi.object({
  url: optionalUrl.required(),
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

module.exports = class SecurityHeaders extends BaseService {
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
    }

    return {
      message: grade,
      color: colorMap[grade],
    }
  }

  async handle(namedParams, { url }) {
    const { res } = await this._request({
      url: `https://securityheaders.com`,
      options: {
        method: 'HEAD',
        qs: {
          q: url,
          hide: 'on',
          followRedirects: 'on',
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
