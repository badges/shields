import emojic from 'emojic'
import Joi from 'joi'
import trace from '../../core/base-service/trace.js'
import { BaseService, queryParams } from '../index.js'
import { optionalUrl } from '../validators.js'
import {
  queryParamSchema,
  renderWebsiteStatus,
  queryParams as websiteQueryParams,
} from '../website-status.js'

const description = `
The existence of a specific path on the server can be checked by appending
a path after the domain name, e.g.
\`https://img.shields.io/website?url=http%3A//www.website.com/path/to/page.html\`.

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

  static openApi = {
    '/website': {
      get: {
        summary: 'Website',
        description,
        parameters: queryParams({
          name: 'url',
          required: true,
          example: 'https://shields.io',
        }).concat(websiteQueryParams),
      },
    },
  }

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
    let isUp = false
    // eslint-disable-next-line no-async-promise-executor
    await new Promise(async (resolve, reject) => {
      setTimeout(resolve, 3500)
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
      resolve()
    })

    return renderWebsiteStatus({
      isUp,
      upMessage,
      downMessage,
      upColor,
      downColor,
    })
  }
}
