import { URL, URLSearchParams } from 'url'
import fetch from 'node-fetch'
import { Inaccessible, InvalidResponse } from './errors.js'

const userAgent = 'Shields.io/2003a'

function object2URLSearchParams(obj) {
  const qs = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue
    } else if (value === null) {
      qs[key] = ''
    } else if (['string', 'number', 'boolean'].includes(typeof value)) {
      qs[key] = value
    }
  }
  return new URLSearchParams(qs)
}

function request2NodeFetch({ url, options }) {
  const requestOptions = Object.assign({}, options)
  const nodeFetchOptions = {}
  const nodeFetchUrl = new URL(url)
  const interchangableOptions = ['headers', 'method', 'body']

  if ('body' in requestOptions && 'form' in requestOptions) {
    throw new Error("Options 'form' and 'body' can not both be used")
  }

  interchangableOptions.forEach(function (opt) {
    if (opt in requestOptions) {
      nodeFetchOptions[opt] = requestOptions[opt]
      delete requestOptions[opt]
    }
  })
  nodeFetchOptions.headers = nodeFetchOptions.headers || {}

  if ('qs' in requestOptions) {
    if (typeof requestOptions.qs === 'string') {
      nodeFetchUrl.search = requestOptions.qs
      delete requestOptions.qs
    } else if (typeof requestOptions.qs === 'object') {
      nodeFetchUrl.search = object2URLSearchParams(requestOptions.qs)
      delete requestOptions.qs
    } else if (requestOptions.qs == null) {
      delete requestOptions.qs
    } else {
      throw new Error("Property 'qs' must be string, object or null")
    }
  }

  if ('gzip' in requestOptions) {
    nodeFetchOptions.compress = requestOptions.gzip
    delete requestOptions.gzip
  }

  if ('auth' in requestOptions) {
    const user = requestOptions.auth.user || ''
    const pass = requestOptions.auth.pass || ''
    const b64authStr = Buffer.from(`${user}:${pass}`).toString('base64')
    nodeFetchOptions.headers.Authorization = `Basic ${b64authStr}`
    delete requestOptions.auth
  }

  if ('form' in requestOptions) {
    nodeFetchOptions.body = object2URLSearchParams(requestOptions.form)
    delete requestOptions.form
  }

  if (Object.keys(requestOptions).length > 0) {
    throw new Error(`Found unrecognised options ${Object.keys(requestOptions)}`)
  }

  return { url: nodeFetchUrl.toString(), options: nodeFetchOptions }
}

async function sendRequest(fetchLimitBytes, url, options) {
  const { url: nodeFetchUrl, options: nodeFetchOptions } = request2NodeFetch({
    url,
    options,
  })
  nodeFetchOptions.headers['User-Agent'] = userAgent
  nodeFetchOptions.size = fetchLimitBytes
  nodeFetchOptions.follow = 10
  try {
    const resp = await fetch(nodeFetchUrl, nodeFetchOptions)
    const body = await resp.text()
    resp.statusCode = resp.status
    const headers = Array.from(resp.headers.entries()).reduce(
      (headers, [name, value]) => {
        headers[name] = value
        return headers
      },
      {}
    )
    return {
      res: {
        ...resp,
        headers,
      },
      buffer: body,
    }
  } catch (err) {
    if (err.type === 'max-size') {
      throw new InvalidResponse({
        underlyingError: new Error('Maximum response size exceeded'),
      })
    }
    throw new Inaccessible({ underlyingError: err })
  }
}

export { request2NodeFetch, sendRequest }
