'use strict'

const {
  NotFound,
  InvalidResponse,
  Inaccessible,
} = require('../services/errors')

const checkErrorResponse = function(
  badgeData,
  err,
  res,
  notFoundMessage = 'not found'
) {
  if (err != null) {
    badgeData.text[1] = 'inaccessible'
    badgeData.colorscheme = 'red'
    return true
  } else if (res.statusCode === 404) {
    badgeData.text[1] = notFoundMessage
    badgeData.colorscheme = 'lightgrey'
    return true
  } else if (res.statusCode !== 200) {
    badgeData.text[1] = 'invalid'
    badgeData.colorscheme = 'lightgrey'
    return true
  } else {
    return false
  }
}

checkErrorResponse.asPromise = function({ notFoundMessage } = {}) {
  return async function({ buffer, res }) {
    const underlyingError = Error(
      `Got status code ${res.statusCode} (expected 200)`
    )
    if (res.statusCode === 404) {
      throw new NotFound({ prettyMessage: notFoundMessage })
    } else if (res.statusCode >= 500) {
      throw new Inaccessible({ underlyingError })
    } else if (res.statusCode !== 200) {
      throw new InvalidResponse({ underlyingError })
    }
    return { buffer, res }
  }
}

async function asJson({ buffer, res }) {
  try {
    return JSON.parse(buffer)
  } catch (err) {
    throw new InvalidResponse({
      prettyMessage: 'unparseable json response',
      underlyingError: err,
    })
  }
}

module.exports = {
  checkErrorResponse,
  asJson,
}
