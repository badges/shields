'use strict'

const fsos = require('fsos')
const TokenPersistence = require('./token-persistence')

class FsTokenPersistence extends TokenPersistence {
  constructor({ path }) {
    super()
    this.path = path
  }

  async initialize() {
    let contents
    try {
      contents = await fsos.get(this.path)
    } catch (e) {
      if (e.code === 'ENOENT') {
        contents = '[]'
      } else {
        throw e
      }
    }

    const tokens = JSON.parse(contents)
    this._tokens = new Set(tokens)
    return tokens
  }

  async save() {
    const tokens = Array.from(this._tokens)
    await fsos.set(this.path, JSON.stringify(tokens))
  }

  async onTokenAdded(token) {
    if (!this._tokens) {
      throw Error('initialize() has not been called')
    }
    this._tokens.add(token)
    await this.save()
  }

  async onTokenRemoved(token) {
    if (!this._tokens) {
      throw Error('initialize() has not been called')
    }
    this._tokens.delete(token)
    await this.save()
  }
}

module.exports = FsTokenPersistence
