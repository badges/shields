'use strict'

const { BaseJsonService } = require('..')

module.exports = class TeamCityBase extends BaseJsonService {
  static get auth() {
    return { userKey: 'teamcity_user', passKey: 'teamcity_pass' }
  }

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
    // JetBrains API Auth Docs: https://confluence.jetbrains.com/display/TCD18/REST+API#RESTAPI-RESTAuthentication
    const options = { qs }
    const auth = this.authHelper.basicAuth
    if (auth) {
      options.auth = auth
    } else {
      qs.guest = 1
    }

    return this._requestJson({
      url: `${protocol}://${hostAndPath}/${apiPath}`,
      schema,
      options,
      errorMessages: { 404: 'build not found', ...errorMessages },
    })
  }
}
