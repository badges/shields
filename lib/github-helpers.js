'use strict'

const { colorScale } = require('./color-formatters')
const {
  checkErrorResponse: standardCheckErrorResponse,
} = require('./error-helper')

function stateColor(s) {
  return { open: '2cbe4e', closed: 'cb2431', merged: '6f42c1' }[s]
}

function checkStateColor(s) {
  return {
    pending: 'dbab09',
    success: '2cbe4e',
    failure: 'cb2431',
    error: 'cb2431',
  }[s]
}

function checkErrorResponse(
  badgeData,
  err,
  res,
  notFoundMessage = 'repo not found',
  errorMessages = {}
) {
  return standardCheckErrorResponse(badgeData, err, res, {
    ...errorMessages,
    404: notFoundMessage,
    422: notFoundMessage,
  })
}

const commentsColor = colorScale([1, 3, 10, 25], undefined, true)

module.exports = {
  stateColor,
  checkStateColor,
  commentsColor,
  checkErrorResponse,
}
