'use strict'

const sinon = require('sinon')
const serverSecrets = require('../../lib/server-secrets')

const user = 'admin'
const pass = 'password'

function mockLegacyJiraCreds() {
  serverSecrets['jira_username'] = undefined
  serverSecrets['jira_password'] = undefined
  sinon.stub(serverSecrets, 'jira_username').value(user)
  sinon.stub(serverSecrets, 'jira_password').value(pass)
}

function mockJiraCreds() {
  serverSecrets['jira_user'] = undefined
  serverSecrets['jira_pass'] = undefined
  sinon.stub(serverSecrets, 'jira_user').value(user)
  sinon.stub(serverSecrets, 'jira_pass').value(pass)
}

function restore() {
  sinon.restore()
}

module.exports = {
  user,
  pass,
  mockJiraCreds,
  mockLegacyJiraCreds,
  restore,
}
