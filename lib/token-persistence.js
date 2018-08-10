'use strict'

const autosave = require('json-autosave')
const githubAuth = require('./github-auth')

// This is currently bound to the legacy github auth code. That will be
// replaced with a dependency-injected token provider.
class TokenPersistence {
  constructor({ path }) {
    this.path = path
    this.save = undefined
  }

  async initialize() {
    // This code is a bit difficult to understand, in part because it's
    // working against the interface of `json-autosave` which wants to own the
    // data structure.
    const save = await autosave(this.path, { data: [] })
    this.save = save

    save.data.forEach(tokenString => {
      githubAuth.addGithubToken(tokenString)
    })

    // Override the autosave handler to refresh the token data before
    // saving.
    save.autosave = () => {
      save.data = githubAuth.getAllTokenIds()
      return save.save()
    }
    // Put the change in autosave handler into effect.
    save.stop()
    save.start()
  }

  async stop() {
    if (this.save) {
      this.save.stop()
      await this.save.autosave()
      this.save = undefined
    }
  }
}

module.exports = TokenPersistence
