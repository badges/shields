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
The badge is of the form
\`https://img.shields.io/website/PROTOCOL/URLREST.svg\`.

The whole URL is obtained by concatenating the \`PROTOCOL\`
(\`http\` or \`https\`, for example) with the
\`URLREST\` (separating them with \`://\`).

The existence of a specific path on the server can be checked by appending
a path after the domain name, e.g.
\`https://img.shields.io/website/http/www.website.com/path/to/page.html.svg\`.

The messages and colors for the up and down states can also be customized.
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
    },
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
