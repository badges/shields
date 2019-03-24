'use strict'

const Joi = require('joi')
const { GithubAuthService } = require('./github-auth-service')
const { errorMessagesFor } = require('./github-helpers')

/*
Only validate the response is an object because we're expecting a response like
{ "Python": 39624, "Shell": 104 }
The keys could be anything and {} is a valid response (e.g: for an empty repo)
*/
const schema = Joi.object().required()

class BaseGithubLanguage extends GithubAuthService {
  async fetch({ user, repo }) {
    return this._requestJson({
      url: `/repos/${user}/${repo}/languages`,
      schema,
      errorMessages: errorMessagesFor(),
    })
  }

  getTotalSize(data) {
    return Object.keys(data).reduce((acc, language) => acc + data[language], 0)
  }
}

module.exports = { BaseGithubLanguage }
