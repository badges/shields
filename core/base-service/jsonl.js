// See available emoji at http://emoji.muan.co/
import emojic from 'emojic'
import { InvalidResponse } from './errors.js'
import trace from './trace.js'

/**
 * Parse a JSONL (newline-delimited JSON) response buffer. Splits the buffer
 * by newlines, trims each line, filters empty lines, and parses each line
 * as JSON. Throws an `InvalidResponse` error when any line is unparseable.
 *
 * @param {string|Buffer} buffer - The raw response body.
 * @returns {Array<object>} Array of parsed JSON values, one per line.
 */
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
