'use strict'

class AuthHelper {
  constructor({ userKey, passKey, isRequired = false }, privateConfig) {
    if (!userKey && !passKey) {
      throw Error('Expected userKey or passKey to be set')
    }

    this._userKey = userKey
    this._passKey = passKey
    this._user = userKey ? privateConfig[userKey] : undefined
    this._pass = passKey ? privateConfig[passKey] : undefined
    this._isRequired = isRequired
  }

  get isConfigured() {
    return (
      (this._userKey ? Boolean(this._user) : true) &&
      (this._passKey ? Boolean(this._pass) : true)
    )
  }

  get isValid() {
    if (this._isRequired) {
      return this.isConfigured
    } else {
      const configIsEmpty = !this._user && !this._pass
      return this.isConfigured || configIsEmpty
    }
  }

  get auth() {
    return this.isConfigured
      ? { user: this._user, pass: this._pass }
      : undefined
  }
}

module.exports = { AuthHelper }
