'use strict'

const {
  NotFound,
  InvalidResponse,
  Inaccessible,
} = require('../services/errors')
const defaultErrorMessages = {
  404: 'not found',
}

const checkErrorResponse = function(badgeData, err, res, errorMessages = {}) {
  errorMessages = { ...defaultErrorMessages, ...errorMessages }
  if (err != null) {
    badgeData.text[1] = 'inaccessible'
    badgeData.colorscheme = 'red'
    return true
  } else if (errorMessages[res.statusCode] !== undefined) {
    badgeData.text[1] = errorMessages[res.statusCode]
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

checkErrorResponse.asPromise = function(errorMessages = {}) {
  return async function({ buffer, res }) {
    errorMessages = { ...defaultErrorMessages, ...errorMessages }
    if (res.statusCode === 404) {
      throw new NotFound({ prettyMessage: errorMessages[404] })
    } else if (res.statusCode !== 200) {
      const underlying = Error(
        `Got status code ${res.statusCode} (expected 200)`
      )
      const props = { underlyingError: underlying }
      if (errorMessages[res.statusCode] !== undefined) {
        props.prettyMessage = errorMessages[res.statusCode]
      }
      if (res.statusCode >= 500) {
        throw new Inaccessible(props)
      }
      throw new InvalidResponse(props)
    }
    return { buffer, res }
  }
}

module.exports = {
  checkErrorResponse,
}
