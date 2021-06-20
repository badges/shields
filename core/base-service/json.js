// See available emoji at http://emoji.muan.co/
import emojic from 'emojic'
import { InvalidResponse } from './errors.js'
import trace from './trace.js'

function parseJson(buffer) {
  const logTrace = (...args) => trace.logTrace('fetch', ...args)
  let json
  try {
    json = JSON.parse(buffer)
  } catch (err) {
    logTrace(emojic.dart, 'Response JSON (unparseable)', buffer)
    throw new InvalidResponse({
      prettyMessage: 'unparseable json response',
      underlyingError: err,
    })
  }
  logTrace(emojic.dart, 'Response JSON (before validation)', json, {
    deep: true,
  })
  return json
}

export { parseJson }
