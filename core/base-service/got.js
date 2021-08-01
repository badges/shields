import got from 'got'
import { Inaccessible, InvalidResponse } from './errors.js'

const userAgent = 'Shields.io/2003a'

function requestOptions2GotOptions(options) {
  const requestOptions = Object.assign({}, options)
  const gotOptions = {}
  const interchangableOptions = ['body', 'form', 'headers', 'method', 'url']

  interchangableOptions.forEach(function (opt) {
    if (opt in requestOptions) {
      gotOptions[opt] = requestOptions[opt]
      delete requestOptions[opt]
    }
  })

  if ('qs' in requestOptions) {
    gotOptions.searchParams = requestOptions.qs
    delete requestOptions.qs
  }

  if ('gzip' in requestOptions) {
    gotOptions.decompress = requestOptions.gzip
    delete requestOptions.gzip
  }

  if ('strictSSL' in requestOptions) {
    gotOptions.https = {
      rejectUnauthorized: requestOptions.strictSSL,
    }
    delete requestOptions.strictSSL
  }

  if ('auth' in requestOptions) {
    gotOptions.username = requestOptions.auth.user
    gotOptions.password = requestOptions.auth.pass
    delete requestOptions.auth
  }

  if (Object.keys(requestOptions).length > 0) {
    throw new Error(`Found unrecognised options ${Object.keys(requestOptions)}`)
  }

  return gotOptions
}

async function sendRequest(gotWrapper, url, options) {
  const gotOptions = requestOptions2GotOptions(options)
  gotOptions.throwHttpErrors = false
  gotOptions.retry = 0
  gotOptions.headers = gotOptions.headers || {}
  gotOptions.headers['User-Agent'] = userAgent
  try {
    const resp = await gotWrapper(url, gotOptions)
    return { res: resp, buffer: resp.body }
  } catch (err) {
    if (err instanceof got.CancelError) {
      throw new InvalidResponse({
        underlyingError: new Error('Maximum response size exceeded'),
      })
    }
    throw new Inaccessible({ underlyingError: err })
  }
}

function fetchFactory(fetchLimitBytes) {
  const gotWithLimit = got.extend({
    handlers: [
      (options, next) => {
        const promiseOrStream = next(options)
        promiseOrStream.on('downloadProgress', progress => {
          if (
            progress.transferred > fetchLimitBytes &&
            // just accept the file if we've already finished downloading
            // the entire file before we went over the limit
            progress.percent !== 1
          ) {
            /*
            TODO: we should be able to pass cancel() a message
            https://github.com/sindresorhus/got/blob/main/documentation/advanced-creation.md#examples
            but by the time we catch it, err.message is just "Promise was canceled"
            */
            promiseOrStream.cancel('Maximum response size exceeded')
          }
        })

        return promiseOrStream
      },
    ],
  })

  return sendRequest.bind(sendRequest, gotWithLimit)
}

export { requestOptions2GotOptions, fetchFactory }
