'use strict'

const Joi = require('joi')
const { nonNegativeInteger } = require('../validators')
const { GithubAuthV3Service } = require('./github-auth-service')
const { errorMessagesFor } = require('./github-helpers')

/*
We're expecting a response like { "Python": 39624, "Shell": 104 }
The keys could be anything and {} is a valid response (e.g: for an empty repo)
*/
const schema = Joi.object().pattern(/./, nonNegativeInteger)

class BaseGithubLanguage extends GithubAuthV3Service {
  async fetch({ user, repo }) {
    return this._requestJson({
      url: `/repos/${user}/${repo}/languages`,
      schema,
      errorMessages: errorMessagesFor(),
    })
  }

  getTotalSize(data) {
    return Object.values(data).reduce((acc, size) => acc + size, 0)
  }
}

module.exports = { BaseGithubLanguage }
