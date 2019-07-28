'use strict'

// See available emoji at http://emoji.muan.co/
const emojic = require('emojic')
const { InvalidResponse } = require('./errors')
const trace = require('./trace')

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

module.exports = {
  parseJson,
}
