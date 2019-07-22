'use strict'

const serverSecrets = require('../../lib/server-secrets')

function constEq(a, b) {
  if (a.length !== b.length) {
    return false
  }
  let zero = 0
  for (let i = 0; i < a.length; i++) {
    zero |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return zero === 0
}

module.exports = function secretIsValid(secret = '') {
  return (
    serverSecrets.shields_secret &&
    constEq(secret, serverSecrets.shields_secret)
  )
}
