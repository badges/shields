'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'JenkinsBuildRedirect',
  title: 'JenkinsBuildRedirect',
  pathPrefix: '/jenkins-ci/s',
}))

t.create('jenkins ci')
  .get('/https/updates.jenkins-ci.org/job/foo.svg', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader(
    'Location',
    '/jenkins/s/https/updates.jenkins-ci.org/job/foo.svg'
  )
