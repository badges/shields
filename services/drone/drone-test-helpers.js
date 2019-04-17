'use strict'

const sinon = require('sinon')
const serverSecrets = require('../../lib/server-secrets')

const token = 'my-token'

function mockDroneCreds() {
  serverSecrets['drone_token'] = undefined
  sinon.stub(serverSecrets, 'drone_token').value(token)
}

function restore() {
  sinon.restore()
}

module.exports = {
  token,
  mockDroneCreds,
  restore,
}
