'use strict'

const { BaseJsonService } = require('..')
const serverSecrets = require('../../lib/server-secrets')

module.exports = class JiraBase extends BaseJsonService {
  static get category() {
    return 'issue-tracking'
  }

  async fetch({ url, qs, schema, errorMessages }) {
    const options = { qs }

    if (serverSecrets.jira_user) {
      options.auth = {
        user: serverSecrets.jira_user,
        pass: serverSecrets.jira_pass,
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
