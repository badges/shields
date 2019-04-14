'use strict'

const Joi = require('joi')
const sinon = require('sinon')
const serverSecrets = require('../../lib/server-secrets')
const { isBuildStatus } = require('../build-status')
const t = (module.exports = require('../tester').createServiceTester())

const isJenkinsBuildStatus = Joi.alternatives(
  isBuildStatus,
  Joi.string().allow('unstable')
)

t.create('build job not found')
  .get('/https/updates.jenkins-ci.org/job/does-not-exist.json')
  .expectBadge({ label: 'build', message: 'instance or job not found' })

t.create('build found (view)')
  .get(
    '/https/jenkins.qa.ubuntu.com/view/Precise/view/All%20Precise/job/precise-desktop-amd64_default.json'
  )
  .expectBadge({ label: 'build', message: isJenkinsBuildStatus })

t.create('build found (job)')
  .get('/https/jenkins.ubuntu.com/server/curtin-vmtest-daily-x.json')
  .expectBadge({ label: 'build', message: isJenkinsBuildStatus })

const user = 'admin'
const pass = 'password'

function mockCreds() {
  serverSecrets['jenkins_user'] = undefined
  serverSecrets['jenkins_pass'] = undefined
  sinon.stub(serverSecrets, 'jenkins_user').value(user)
  sinon.stub(serverSecrets, 'jenkins_pass').value(pass)
}

t.create('with mock credentials')
  .before(mockCreds)
  .get('/https/jenkins.ubuntu.com/server/curtin-vmtest-daily-x.json')
  .intercept(nock =>
    nock('https://jenkins.ubuntu.com/server/job/curtin-vmtest-daily-x')
      .get(`/api/json?tree=color`)
      // This ensures that the expected credentials from serverSecrets are actually being sent with the HTTP request.
      // Without this the request wouldn't match and the test would fail.
      .basicAuth({
        user,
        pass,
      })
      .reply(200, { color: 'blue' })
  )
  .finally(sinon.restore)
  .expectBadge({ label: 'build', message: 'passing' })
