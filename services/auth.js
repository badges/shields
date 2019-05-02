'use strict'

const { BaseService } = require('.')

function requiredAuth(serviceInstance, userKey, passKey) {
  if (!(serviceInstance instanceof BaseService)) {
    throw Error('serviceInstance should be an instance of BaseService')
  }

  return {
    user: userKey ? serviceInstance.getSecret(userKey) : '',
    pass: passKey ? serviceInstance.getSecret(passKey) : '',
  }
}

function optionalAuth(serviceInstance, userKey, passKey) {
  if (!(serviceInstance instanceof BaseService)) {
    throw Error('serviceInstance should be an instance of BaseService')
  }

  let user = '',
    pass = ''
  if (userKey && !(user = serviceInstance.tryGetSecret(userKey))) {
    return undefined
  }
  if (passKey && !(pass = serviceInstance.tryGetSecret(passKey))) {
    return undefined
  }
  return { user, pass }
}

module.exports = {
  requiredAuth,
  optionalAuth,
}
