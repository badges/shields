// See available emoji at http://emoji.muan.co/
import emojic from 'emojic'
import { InvalidResponse } from './errors.js'
import trace from './trace.js'

function parseJsonl(buffer) {
  const logTrace = (...args) => trace.logTrace('fetch', ...args)
  let jsonl
  try {
    jsonl = buffer
      .toString()
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => JSON.parse(line))
  } catch (err) {
    logTrace(emojic.dart, 'Response JSONL (unparseable)', buffer)
    throw new InvalidResponse({
      prettyMessage: 'unparseable jsonl response',
      underlyingError: err,
    })
  }
  logTrace(emojic.dart, 'Response JSONL (before validation)', jsonl, {
    deep: true,
  })
  return jsonl
}

export { parseJsonl }
