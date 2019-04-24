'use strict'

const { BaseJsonService } = require('..')
const serverSecrets = require('../../lib/server-secrets')

module.exports = class JenkinsBase extends BaseJsonService {
  async fetch({
    url,
    schema,
    qs,
    errorMessages = { 404: 'instance or job not found' },
    disableStrictSSL,
  }) {
    const options = { qs, strictSSL: disableStrictSSL === undefined }

    if (serverSecrets.jenkins_user) {
      options.auth = {
        user: serverSecrets.jenkins_user,
        pass: serverSecrets.jenkins_pass,
      }
    }

    return this._requestJson({
      url,
      options,
      schema,
      errorMessages,
    })
  }
}
