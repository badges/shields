'use strict'

const { BaseJsonService } = require('..')

module.exports = class TeamCityBase extends BaseJsonService {
  static auth = {
    userKey: 'teamcity_user',
    passKey: 'teamcity_pass',
    serviceKey: 'teamcity',
  }

  async fetch({ url, schema, qs = {}, errorMessages = {} }) {
    // JetBrains API Auth Docs: https://confluence.jetbrains.com/display/TCD18/REST+API#RESTAPI-RESTAuthentication
    const options = { qs }
    if (!this.authHelper.isConfigured) {
      qs.guest = 1
    }

    return this._requestJson(
      this.authHelper.withBasicAuth({
        url,
        schema,
        options,
        errorMessages: { 404: 'build not found', ...errorMessages },
      })
    )
  }
}
