import Joi from 'joi'
import emojic from 'emojic'
import { optionalUrl } from '../validators.js'
import {
  queryParamSchema,
  exampleQueryParams,
  renderWebsiteStatus,
} from '../website-status.js'
import { BaseService } from '../index.js'
import trace from '../../core/base-service/trace.js'

const documentation = `
<p>
  The badge is of the form
  <code>https://img.shields.io/website/PROTOCOL/URLREST.svg</code>.
</p>
<p>
  The whole URL is obtained by concatenating the <code>PROTOCOL</code>
  (<code>http</code> or <code>https</code>, for example) with the
  <code>URLREST</code> (separating them with <code>://</code>).
</p>
<p>
  The existence of a specific path on the server can be checked by appending
  a path after the domain name, e.g.
  <code>https://img.shields.io/website/http/www.website.com/path/to/page.html.svg</code>.
</p>
<p>
  The messages and colors for the up and down states can also be customized.
</p>
`

const urlQueryParamSchema = Joi.object({
  url: optionalUrl.required(),
}).required()

export default class Website extends BaseService {
  static category = 'monitoring'

  static route = {
    base: '',
    pattern: 'website',
    queryParamSchema: queryParamSchema.concat(urlQueryParamSchema),
  }

  static examples = [
    {
      title: 'Website',
      namedParams: {},
      queryParams: {
        ...exampleQueryParams,
        ...{ url: 'https://shields.io' },
      },
      staticPreview: renderWebsiteStatus({ isUp: true }),
      documentation,
    },
  ]

  static defaultBadgeData = {
    label: 'website',
  }

  async _request({ url, options = {} }) {
    const logTrace = (...args) => trace.logTrace('fetch', ...args)
    logTrace(emojic.bowAndArrow, 'Request', url, '\n', options)
    const { res, buffer } = await this._requestFetcher(url, options)
    await this._meterResponse(res, buffer)
    logTrace(emojic.dart, 'Response status code', res.statusCode)
    return { res, buffer }
  }

  async handle(
    _routeParams,
    {
      up_message: upMessage,
      down_message: downMessage,
      up_color: upColor,
      down_color: downColor,
      url,
    }
  ) {
    let isUp
    try {
      const {
        res: { statusCode },
      } = await this._request({
        url,
        options: {
          method: 'HEAD',
        },
      })
      // We consider all HTTP status codes below 310 as success.
      isUp = statusCode < 310
    } catch (e) {
      // Catch all errors thrown by the request.
      isUp = false
    }

    return renderWebsiteStatus({
      isUp,
      upMessage,
      downMessage,
      upColor,
      downColor,
    })
  }
}
