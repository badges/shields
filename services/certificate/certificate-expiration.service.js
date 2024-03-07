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
    trace.logTrace('outbound', emojic.womanCook, 'trying', hostname)
    let resp
    try {
      resp = await this._request({
        url: `https://${hostname}/`,
        options: {
          followRedirect: false,
        },
      })
      return { expiresStr: resp.res.req.socket.getPeerCertificate().valid_to }
    } catch (err) {
      // since got will throw on a redirect, we need to catch it here and possibly return the expiration date we found
      const expiresStr = resp?.res?.req?.socket?.getPeerCertificate()?.valid_to
      trace.logTrace(
        'outbound',
        emojic.noGoodWoman,
        'fetch error',
        hostname,
        expiresStr,
        err,
      )
      if (!expiresStr) {
        throw err
      }
      return { expiresStr }
    }
  }

  async handle({ hostname }, { warningDays = 30, dangerDays = 7 }) {
    try {
      const { expiresStr } = await this.fetch({ hostname })
      const expires = new Date()
      expires.setTime(Date.parse(expiresStr))
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
      console.log('handle err', err)
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
