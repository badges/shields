'use strict'

const sinon = require('sinon')
const serverSecrets = require('../../lib/server-secrets')

const user = 'admin'
const pass = 'password'

function mockTeamCityCreds() {
  serverSecrets['teamcity_user'] = undefined
  serverSecrets['teamcity_pass'] = undefined
  sinon.stub(serverSecrets, 'teamcity_user').value(user)
  sinon.stub(serverSecrets, 'teamcity_pass').value(pass)
}

function restore() {
  sinon.restore()
}

module.exports = {
  user,
  pass,
  mockTeamCityCreds,
  restore,
}
