import ky from 'ky'
import { EnvHttpProxyAgent } from 'undici'
import { Inaccessible, InvalidResponse } from './errors.js'
import {
  fetchLimitBytes as fetchLimitBytesDefault,
  getUserAgent,
} from './ky-config.js'

const userAgent = getUserAgent()
let insecureHttpsDispatcher

function getInsecureHttpsDispatcher() {
  if (!insecureHttpsDispatcher) {
    const prefix = process.env.GLOBAL_AGENT_ENVIRONMENT_VARIABLE_NAMESPACE || ''
    const httpProxy =
      process.env[`${prefix}http_proxy`] ||
      process.env[`${prefix}HTTP_PROXY`] ||
      ''
    const httpsProxy =
      process.env[`${prefix}https_proxy`] ||
      process.env[`${prefix}HTTPS_PROXY`] ||
      httpProxy
    const noProxy =
      process.env[`${prefix}no_proxy`] || process.env[`${prefix}NO_PROXY`] || ''
    insecureHttpsDispatcher = new EnvHttpProxyAgent({
      httpProxy,
      httpsProxy,
      noProxy,
      connect: { rejectUnauthorized: false },
      requestTls: { rejectUnauthorized: false },
    })
  }
  return insecureHttpsDispatcher
}

class ResponseSizeError extends Error {}

function findErrorCode(error) {
  const visited = new Set()
  let current = error
  while (current && !visited.has(current)) {
    if (typeof current.code === 'string') {
      return current.code
    }
    visited.add(current)
    current = current.cause
  }
}

function unwrapError(error) {
  const visited = new Set()
  let current = error
  while (current?.cause instanceof Error && !visited.has(current)) {
    visited.add(current)
    current = current.cause
  }
  return current
}

function withoutUndefinedHeaders(headers) {
  if (!headers || headers instanceof Headers) {
    return headers
  }
  if (Array.isArray(headers)) {
    return headers.filter(([, value]) => value !== undefined)
  }
  return Object.fromEntries(
    Object.entries(headers).filter(([, value]) => value !== undefined),
  )
}

function normalizeSearchParams(searchParams) {
  if (
    typeof searchParams === 'string' ||
    searchParams instanceof URLSearchParams
  ) {
    return new URLSearchParams(searchParams)
  }
  const entries = Array.isArray(searchParams)
    ? searchParams
    : Object.entries(searchParams)
  return new URLSearchParams(
    entries
      .filter(([, value]) => value !== undefined)
      .map(([name, value]) => [name, value === null ? '' : value]),
  )
}

async function readResponseBody(
  response,
  fetchLimitBytes,
  onProgress,
  skipBody,
) {
  if (skipBody) {
    return ''
  }
  if (!response.body) {
    return ''
  }

  const contentLength = Number(response.headers.get('content-length'))
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let body = ''
  let transferredBytes = 0
  let reportedBytes = 0
  let previousChunk

  const reportProgress = async (progress, chunk) => {
    try {
      onProgress?.(progress, chunk)
    } catch (error) {
      await reader.cancel().catch(() => undefined)
      throw error
    }
  }
  await reportProgress(
    {
      percent: 0,
      totalBytes: contentLength || 0,
      transferredBytes: 0,
    },
    new Uint8Array(),
  )

  for (;;) {
    const { done, value } = await reader.read()
    if (done) {
      if (previousChunk) {
        reportedBytes += previousChunk.byteLength
        await reportProgress(
          {
            percent: 1,
            totalBytes: Math.max(contentLength || 0, reportedBytes),
            transferredBytes: reportedBytes,
          },
          previousChunk,
        )
      }
      body += decoder.decode()
      return body
    }

    transferredBytes += value.byteLength
    if (transferredBytes > fetchLimitBytes) {
      await reader.cancel().catch(() => undefined)
      throw new ResponseSizeError('Maximum response size exceeded')
    }
    if (previousChunk) {
      reportedBytes += previousChunk.byteLength
      let percent = contentLength ? reportedBytes / contentLength : 0
      if (percent >= 1) {
        percent = 1 - Number.EPSILON
      }
      await reportProgress(
        {
          percent,
          totalBytes: Math.max(contentLength || 0, reportedBytes),
          transferredBytes: reportedBytes,
        },
        previousChunk,
      )
    }
    previousChunk = value
    body += decoder.decode(value, { stream: true })
  }
}

const client = ky.create({
  retry: { limit: 0 },
  throwHttpErrors: false,
  // Keep requests unlimited by default. Explicit timeouts are enforced below
  // for the complete response, including its body.
  timeout: false,
})

function _fetchFactory(fetchLimitBytes = fetchLimitBytesDefault) {
  return async function sendRequest(url, options = {}, systemErrors = {}) {
    const requestOptions = { ...options }
    requestOptions.throwHttpErrors = false
    requestOptions.retry = { limit: 0 }
    const httpsOptions = requestOptions.https
    delete requestOptions.https
    if (
      httpsOptions?.rejectUnauthorized === false &&
      requestOptions.dispatcher === undefined
    ) {
      requestOptions.dispatcher = getInsecureHttpsDispatcher()
    }

    const headers = new Headers(withoutUndefinedHeaders(requestOptions.headers))
    headers.set('User-Agent', userAgent)
    requestOptions.headers = headers

    let requestUrl = url
    if (requestOptions.searchParams !== undefined) {
      requestUrl = new URL(url)
      requestUrl.search = normalizeSearchParams(
        requestOptions.searchParams,
      ).toString()
      delete requestOptions.searchParams
    }

    const timeoutMilliseconds = requestOptions.timeout
    requestOptions.timeout = false

    const onDownloadProgress = requestOptions.onDownloadProgress
    delete requestOptions.onDownloadProgress

    let timeoutId
    let timedOut = false
    if (typeof timeoutMilliseconds === 'number') {
      const timeoutController = new AbortController()
      requestOptions.signal = requestOptions.signal
        ? AbortSignal.any([requestOptions.signal, timeoutController.signal])
        : timeoutController.signal
      timeoutId = setTimeout(() => {
        timedOut = true
        timeoutController.abort()
      }, timeoutMilliseconds)
    }

    try {
      const response = await client(requestUrl, requestOptions)
      const body = await readResponseBody(
        response,
        fetchLimitBytes,
        onDownloadProgress,
        requestOptions.method?.toUpperCase() === 'HEAD',
      )
      const res = {
        statusCode: response.status,
        statusMessage: response.statusText,
        headers: Object.fromEntries(response.headers),
        body,
        redirected: response.redirected,
        requestUrl: new URL(response.url || requestUrl),
      }
      return { res, buffer: body }
    } catch (error) {
      if (error instanceof ResponseSizeError) {
        throw new InvalidResponse({ underlyingError: error })
      }

      const errorCode = timedOut ? 'ETIMEDOUT' : findErrorCode(error)
      const underlyingError = timedOut
        ? new Error(`Request timed out after ${timeoutMilliseconds}ms`)
        : unwrapError(error)
      if (errorCode in systemErrors) {
        throw new Inaccessible({
          ...systemErrors[errorCode],
          underlyingError,
        })
      }
      throw new Inaccessible({ underlyingError })
    } finally {
      clearTimeout(timeoutId)
    }
  }
}

const fetch = _fetchFactory()

export { fetch, _fetchFactory }
