'use strict'

const sinon = require('sinon')
const serverSecrets = require('../../lib/server-secrets')

const user = 'admin'
const pass = 'password'

function mockBitbucketCreds() {
  serverSecrets['bitbucket_username'] = undefined
  serverSecrets['bitbucket_password'] = undefined
  sinon.stub(serverSecrets, 'bitbucket_username').value(user)
  sinon.stub(serverSecrets, 'bitbucket_password').value(pass)
}

function mockBitbucketServerCreds() {
  serverSecrets['bitbucket_server_username'] = undefined
  serverSecrets['bitbucket_server_password'] = undefined
  sinon.stub(serverSecrets, 'bitbucket_server_username').value(user)
  sinon.stub(serverSecrets, 'bitbucket_server_password').value(pass)
}

function restore() {
  sinon.restore()
}

module.exports = {
  user,
  pass,
  mockBitbucketCreds,
  mockBitbucketServerCreds,
  restore,
}
