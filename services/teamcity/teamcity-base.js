'use strict'

const serverSecrets = require('../../lib/server-secrets')
const { BaseJsonService } = require('..')

module.exports = class TeamCityBase extends BaseJsonService {
  async fetch({
    protocol,
    hostAndPath,
    apiPath,
    schema,
    qs = {},
    errorMessages = {},
  }) {
    if (!hostAndPath) {
      // If hostAndPath is undefined then the user specified the legacy default path
      protocol = 'https'
      hostAndPath = 'teamcity.jetbrains.com'
    }
    const url = `${protocol}://${hostAndPath}/${apiPath}`
    const options = { qs }
    // JetBrains API Auth Docs: https://confluence.jetbrains.com/display/TCD18/REST+API#RESTAPI-RESTAuthentication
    if (serverSecrets.teamcity_user) {
      options.auth = {
        user: serverSecrets.teamcity_user,
        pass: serverSecrets.teamcity_pass,
      }
    } else {
      qs.guest = 1
    }

    const defaultErrorMessages = {
      404: 'build not found',
    }
    const errors = { ...defaultErrorMessages, ...errorMessages }

    return this._requestJson({
      url,
      schema,
      options,
      errorMessages: errors,
    })
  }
}
