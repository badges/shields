'use strict'

const BaseJsonService = require('../base-json')
const serverSecrets = require('../../lib/server-secrets')

module.exports = class JiraBase extends BaseJsonService {
  static get category() {
    return 'issue-tracking'
  }

  async fetch({ url, qs, schema, errorMessages }) {
    const options = { qs }

    if (serverSecrets && serverSecrets.jira_username) {
      options.auth = {
        user: serverSecrets.jira_username,
        pass: serverSecrets.jira_password,
      }
    }

    return this._requestJson({
      schema,
      url,
      options,
      errorMessages,
    })
  }
}
