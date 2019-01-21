'use strict'

const log = require('../server/log')

// This is currently bound to the legacy github auth code. That will be
// replaced with a dependency-injected token provider.
class TokenPersistence {
  constructor() {
    this.noteTokenAdded = this.noteTokenAdded.bind(this)
    this.noteTokenRemoved = this.noteTokenRemoved.bind(this)
  }

  async initialize() {
    throw Error('initialize() is not implemented')
  }

  async stop() {}

  async onTokenAdded(token) {
    throw Error('onTokenAdded() is not implemented')
  }

  async noteTokenAdded(token) {
    try {
      await this.onTokenAdded(token)
    } catch (e) {
      log.error(e)
    }
  }

  async onTokenRemoved(token) {
    throw Error('onTokenRemoved() is not implemented')
  }

  async noteTokenRemoved(token) {
    try {
      await this.onTokenRemoved(token)
    } catch (e) {
      log.error(e)
    }
  }
}

module.exports = TokenPersistence
