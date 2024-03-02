import tls from 'tls'
import emojic from 'emojic'
import Joi from 'joi'
import { BaseService, pathParam, queryParam } from '../index.js'
import trace from '../../core/base-service/trace.js'

const queryParamSchema = Joi.object({
  warningDays: Joi.number().min(0),
  dangerDays: Joi.number().min(0),
}).required()

export default class CertificateExpiration extends BaseService {
  static category = 'monitoring'

  static route = {
    base: 'certificate/expiration',
    pattern: ':hostname',
    queryParamSchema,
  }

  static openApi = {
    '/certificate/expiration/{hostname}': {
      get: {
        summary: 'Certificate Expiration',
        parameters: [
          pathParam({ name: 'hostname', example: 'shields.io' }),
          queryParam({
            name: 'warningDays',
            schema: { type: 'number' },
            description:
              'Warning (yellow) if less than this many days remain (default=30)',
            example: '30',
          }),
          queryParam({
            name: 'dangerDays',
            schema: { type: 'number' },
            description:
              'Danger (red) if less than this many days remain (default=7)',
            example: '7',
          }),
        ],
      },
    },
  }

  static _cacheLength = 0

  async fetch({ hostname }) {
    let expires = null
    trace.logTrace('outbound', emojic.womanCook, 'trying', hostname)
    try {
      await this._request({
        cache: false,
        method: 'GET',
        url: `https://${hostname}/`,
        options: {
          // explicitly set followRedirect to false to avoid getting the post-redirect certificate
          followRedirect: false,
          headers: {
            'cache-control': 'no-cache',
          },
          https: {
            checkServerIdentity: (innerhost, certificate) => {
              const mismatchErr = tls.checkServerIdentity(hostname, certificate)
              if (mismatchErr) {
                return mismatchErr
              }
              trace.logTrace('validate', emojic.dart, 'cert found', certificate)
              if (certificate?.valid_to != null) {
                expires = new Date()
                expires.setTime(Date.parse(certificate?.valid_to))
              }
              return undefined
            },
          },
          // we don't actually care about 4xx/5xx HTTP errors, we just want the expiration date
          throwHttpErrors: false,
        },
      })
    } catch (err) {
      // since got will throw on a redirect, we need to catch it here and possibly return the expiration date we found
      trace.logTrace(
        'outbound',
        emojic.noGoodWoman,
        'fetch error',
        hostname,
        expires,
        err,
      )
      return { expires }
    }
    trace.logTrace('outbound', emojic.womanCook, 'success', hostname, expires)
    return { expires }
  }

  async handle({ hostname }, { warningDays = 30, dangerDays = 7 }) {
    try {
      const { expires } = await this.fetch({ hostname })
      const warningThreshold =
        new Date().getTime() + warningDays * 24 * 60 * 60 * 1000
      const dangerThreshold =
        new Date().getTime() + dangerDays * 24 * 60 * 60 * 1000
      const message = expires.toISOString().slice(0, 10)
      let color = 'green'
      if (expires.getTime() < dangerThreshold) {
        color = 'red'
      } else if (expires.getTime() < warningThreshold) {
        color = 'yellow'
      }
      return {
        label: hostname,
        color,
        message,
      }
    } catch (err) {
      trace.logTrace(
        'unhandledError',
        emojic.noGoodWoman,
        'handle error',
        hostname,
        err,
      )
      return { label: hostname, color: 'red', message: 'error' }
    }
  }
}
