import { BaseJsonService } from '../index.js'

export default class TeamCityBase extends BaseJsonService {
  static auth = {
    userKey: 'teamcity_user',
    passKey: 'teamcity_pass',
    serviceKey: 'teamcity',
  }

  async fetch({ url, schema, searchParams = {}, httpErrors = {} }) {
    // JetBrains API Auth Docs: https://confluence.jetbrains.com/display/TCD18/REST+API#RESTAPI-RESTAuthentication
    const options = { searchParams }
    if (!this.authHelper.isConfigured) {
      searchParams.guest = 1
    }

    return this._requestJson(
      this.authHelper.withBasicAuth({
        url,
        schema,
        options,
        httpErrors: { 404: 'build not found', ...httpErrors },
      }),
    )
  }
}
