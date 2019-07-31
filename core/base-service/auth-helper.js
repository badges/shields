'use strict'

class AuthHelper {
  constructor({ userKey, passKey, isRequired = false }, privateConfig) {
    if (!userKey && !passKey) {
      throw Error('Expected userKey or passKey to be set')
    }

    this._userKey = userKey
    this._passKey = passKey
    this.user = userKey ? privateConfig[userKey] : undefined
    this.pass = passKey ? privateConfig[passKey] : undefined
    this.isRequired = isRequired
  }

  get isConfigured() {
    return (
      (this._userKey ? Boolean(this.user) : true) &&
      (this._passKey ? Boolean(this.pass) : true)
    )
  }

  get isValid() {
    if (this.isRequired) {
      return this.isConfigured
    } else {
      const configIsEmpty = !this.user && !this.pass
      return this.isConfigured || configIsEmpty
    }
  }

  get basicAuth() {
    const { user, pass } = this
    return this.isConfigured ? { user, pass } : undefined
  }

  get bearerAuthHeader() {
    const { pass } = this
    return this.isConfigured ? { Authorization: `Bearer ${pass}` } : undefined
  }
}

module.exports = { AuthHelper }
