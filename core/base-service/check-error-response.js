import log from '../server/log.js'
import { NotFound, InvalidResponse, Inaccessible } from './errors.js'

const defaultErrorMessages = {
  404: 'not found',
  429: 'rate limited by upstream service',
}

const headersToInclude = ['cf-ray']

export default function checkErrorResponse(httpErrors = {}, logErrors = [429]) {
  return async function ({ buffer, res }) {
    let error
    httpErrors = { ...defaultErrorMessages, ...httpErrors }
    if (res.statusCode === 404) {
      error = new NotFound({ prettyMessage: httpErrors[404] })
    } else if (res.statusCode !== 200) {
      const underlying = Error(
        `Got status code ${res.statusCode} (expected 200)`,
      )
      const props = { underlyingError: underlying }
      if (httpErrors[res.statusCode] !== undefined) {
        props.prettyMessage = httpErrors[res.statusCode]
      }
      if (res.statusCode >= 500) {
        error = new Inaccessible(props)
      } else {
        error = new InvalidResponse(props)
      }
    }

    if (logErrors.includes(res.statusCode)) {
      const tags = {}
      for (const headerKey of headersToInclude) {
        const headerValue = res.headers[headerKey]
        if (headerValue) {
          tags[`header-${headerKey}`] = headerValue
        }
      }
      log.error(
        new Error(`${res.statusCode} calling ${res.requestUrl.origin}`),
        tags,
      )
    }

    if (error) {
      error.response = res
      error.buffer = buffer
      throw error
    } else {
      return { buffer, res }
    }
  }
}
