'use strict'

const { BaseJsonService } = require('..')

module.exports = class JenkinsBase extends BaseJsonService {
  static get auth() {
    return {
      userKey: 'jenkins_user',
      passKey: 'jenkins_pass',
    }
  }

  async fetch({
    url,
    schema,
    qs,
    errorMessages = { 404: 'instance or job not found' },
    disableStrictSSL,
  }) {
    return this._requestJson({
      url,
      options: {
        qs,
        strictSSL: disableStrictSSL === undefined,
        auth: this.authHelper.basicAuth,
      },
      schema,
      errorMessages,
    })
  }
}
