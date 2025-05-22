import { Inaccessible, InvalidResponse } from './errors.js'
import {
  fetchLimitBytes as fetchLimitBytesDefault,
  getUserAgent,
} from './fetch-config.js'

const userAgent = getUserAgent()

class FetchError extends Error {
  constructor(message, code) {
    super(message)
    this.code = code
  }
}

async function sendRequest(url, options = {}, systemErrors = {}) {
  const fetchOptions = {
    ...options,
    headers: {
      'User-Agent': userAgent,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, fetchOptions)

    // Handle HTTP errors
    if (!response.ok) {
      throw new FetchError(
        `HTTP error! status: ${response.status}`,
        response.status,
      )
    }

    // Handle response size limit
    const contentLength = response.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > fetchLimitBytesDefault) {
      throw new InvalidResponse({
        underlyingError: new Error('Maximum response size exceeded'),
      })
    }

    // Read response as buffer
    const buffer = await response.arrayBuffer()

    return {
      res: {
        statusCode: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: Buffer.from(buffer),
      },
      buffer: Buffer.from(buffer),
    }
  } catch (err) {
    if (err instanceof FetchError) {
      if (err.code in systemErrors) {
        throw new Inaccessible({
          ...systemErrors[err.code],
          underlyingError: err,
        })
      }
    }
    throw new Inaccessible({ underlyingError: err })
  }
}

export { sendRequest as fetch }
