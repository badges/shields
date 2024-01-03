import Joi from 'joi'
import { BaseJsonService, pathParams } from '../index.js'

const label = 'hsts preloaded'
const schema = Joi.object({
  status: Joi.string().required(),
}).required()

const description = `
[\`Strict-Transport-Security\` is an HTTP response header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)
that signals that browsers should only access the site using HTTPS.

For a higher level of security, it's possible for a domain owner to
[preload this behavior into participating web browsers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security#Preloading_Strict_Transport_Security).
Chromium maintains the [HSTS preload list](https://www.chromium.org/hsts), which
is the de facto standard that has been adopted by several browsers.
This service checks a domain's status in that list.
`

export default class HSTS extends BaseJsonService {
  static category = 'monitoring'

  static route = {
    base: 'hsts/preload',
    pattern: ':domain',
  }

  static openApi = {
    '/hsts/preload/{domain}': {
      get: {
        summary: 'Chromium HSTS preload',
        description,
        parameters: pathParams({
          name: 'domain',
          example: 'github.com',
        }),
      },
    },
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

  async fetch({ domain }) {
    return this._requestJson({
      schema,
      url: 'https://hstspreload.org/api/v2/status',
      options: { searchParams: { domain } },
    })
  }

  async handle({ domain }) {
    const { status } = await this.fetch({ domain })
    return this.constructor.render({ status })
  }
}
