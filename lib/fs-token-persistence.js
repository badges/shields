'use strict'

const fsos = require('fsos')
const githubAuth = require('./github-auth')
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
    tokens.forEach(tokenString => {
      githubAuth.addGithubToken(tokenString)
    })
  }

  async save() {
    const tokens = githubAuth.getAllTokenIds()
    await fsos.set(this.path, JSON.stringify(tokens))
  }

  async onTokenAdded(token) {
    await this.save()
  }

  async onTokenRemoved(token) {
    await this.save()
  }
}

module.exports = FsTokenPersistence
