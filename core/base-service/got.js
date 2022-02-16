import got, { CancelError } from 'got'
import { Inaccessible, InvalidResponse } from './errors.js'
import {
  fetchLimitBytes as fetchLimitBytesDefault,
  getUserAgent,
} from './got-config.js'

const userAgent = getUserAgent()

async function sendRequest(gotWrapper, url, options) {
  const gotOptions = Object.assign({}, options)
  gotOptions.throwHttpErrors = false
  gotOptions.retry = { limit: 0 }
  gotOptions.headers = gotOptions.headers || {}
  gotOptions.headers['User-Agent'] = userAgent
  try {
    const resp = await gotWrapper(url, gotOptions)
    return { res: resp, buffer: resp.body }
  } catch (err) {
    if (err instanceof CancelError) {
      throw new InvalidResponse({
        underlyingError: new Error('Maximum response size exceeded'),
      })
    }
    throw new Inaccessible({ underlyingError: err })
  }
}

function _fetchFactory(fetchLimitBytes = fetchLimitBytesDefault) {
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

const fetch = _fetchFactory()

export { fetch, _fetchFactory }
