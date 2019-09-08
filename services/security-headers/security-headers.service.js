'use strict'

const { BaseService } = require('..')

const documentation = `
<p>
  The <a href="https://securityheaders.com/">Security Headers</a>
  provide a easy mechanism to analyze HTTP response headers and give information on how to deploy missing headers.
</p>
</p>
  The scan result will be hidden from the public result list and follow redirects will be on too.
<p>
`

module.exports = class SecurityHeaders extends BaseService {
  static get category() {
    return 'monitoring'
  }

  static get route() {
    return {
      base: 'security-headers',
      pattern: ':protocol(https|http)/:host',
    }
  }

  static get examples() {
    return [
      {
        title: 'Security Headers',
        namedParams: {
          protocol: 'https',
          host: 'shields.io',
        },
        staticPreview: this.render({
          grade: 'A+',
        }),
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'securityheaders',
    }
  }

  static render({ grade }) {
    if (!grade) {
      return {
        message: 'error',
        color: 'lightgrey',
      }
    }

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

  async handle({ protocol, host }) {
    let grade

    try {
      const { res } = await this._request({
        url: `https://securityheaders.com/?q=${protocol}%3A%2F%2F${host}&hide=on&followRedirects=on`,
        options: {
          method: 'HEAD',
        },
      })

      grade = res.headers['x-grade']
    } catch (e) {
      // Catch all errors thrown by the request.
    }

    return this.constructor.render({ grade })
  }
}
