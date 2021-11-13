import got from 'got'
import { Inaccessible, InvalidResponse } from './errors.js'

const userAgent = 'Shields.io/2003a'

async function sendRequest(gotWrapper, url, options) {
  const gotOptions = Object.assign({}, options)
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

const TEN_MB = 10485760
function fetchFactory(fetchLimitBytes = TEN_MB) {
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

export { fetchFactory, userAgent }
