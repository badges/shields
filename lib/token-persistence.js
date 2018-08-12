'use strict'

const fsos = require('fsos')
const githubAuth = require('./github-auth')

// This is currently bound to the legacy github auth code. That will be
// replaced with a dependency-injected token provider.
class TokenPersistence {
  constructor({ path }) {
    this.path = path

    this.noteTokenAdded = this.noteTokenAdded.bind(this)
    this.noteTokenRemoved = this.noteTokenRemoved.bind(this)
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

  async noteTokenAdded(token) {
    try {
      await this.save()
    } catch (e) {
      console.error(e)
      // TODO send to sentry
    }
  }

  async noteTokenRemoved(token) {
    try {
      await this.save()
    } catch (e) {
      console.error(e)
      // TODO send to sentry
    }
  }
}

module.exports = TokenPersistence
