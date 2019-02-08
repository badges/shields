'use strict'

const label = 'hsts preloaded'
const { BaseJsonService } = require('..')

const Joi = require('joi')
const schema = Joi.object({
  status: Joi.string().required(),
}).required()

const documentation = `
<p>
  <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security">
  <code>Strict-Transport-Security</code> is an HTTP response header</a> that signals that browsers should
  only access the site using HTTPS.
</p>
<p>
  For a higher level of security, it's possible for a domain owner to
  <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security#Preloading_Strict_Transport_Security">preload
  this behavior into participating web browsers</a>. Chromium maintains the <a href="https://www.chromium.org/hsts">HSTS preload list</a>, which
  is the de facto standard that has been adopted by several browsers. This service checks a domain's status in that list.
</p>
`

module.exports = class HSTS extends BaseJsonService {
  static get category() {
    return 'monitoring'
  }

  static get route() {
    return {
      base: 'hsts/preload',
      pattern: ':domain',
    }
  }

  static get examples() {
    return [
      {
        title: 'Chromium HSTS preload',
        namedParams: { domain: 'github.com' },
        staticPreview: this.render({ status: 'preloaded' }),
        keywords: ['security'],
        documentation,
      },
    ]
  }

  async fetch({ domain }) {
    return this._requestJson({
      schema,
      url: `https://hstspreload.org/api/v2/status`,
      options: { qs: { domain } },
    })
  }

  async handle({ domain }) {
    const { status } = await this.fetch({ domain })
    return this.constructor.render({ status })
  }

  static render({ status }) {
    let color = 'red'

    if (status === 'unknown') {
      status = 'no'
    } else if (status === 'preloaded') {
      status = 'yes'
      color = 'brightgreen'
    } else if (status === 'pending') {
      color = 'yellow'
    }

    return { message: status, label, color }
  }
}
