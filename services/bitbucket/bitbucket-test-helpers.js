'use strict'

const sinon = require('sinon')
const serverSecrets = require('../../lib/server-secrets')

const user = 'admin'
const pass = 'password'

function mockBitbucketCreds() {
  serverSecrets['bitbucket_user'] = undefined
  serverSecrets['bitbucket_pass'] = undefined
  sinon.stub(serverSecrets, 'bitbucket_user').value(user)
  sinon.stub(serverSecrets, 'bitbucket_pass').value(pass)
}

function mockBitbucketServerCreds() {
  serverSecrets['bitbucket_server_user'] = undefined
  serverSecrets['bitbucket_server_pass'] = undefined
  sinon.stub(serverSecrets, 'bitbucket_server_user').value(user)
  sinon.stub(serverSecrets, 'bitbucket_server_pass').value(pass)
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
