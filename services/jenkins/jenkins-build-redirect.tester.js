'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'JenkinsBuildRedirect',
  title: 'JenkinsBuildRedirect',
  pathPrefix: '/',
}))

t.create('jenkins ci')
  .get('jenkins-ci/s/https/updates.jenkins-ci.org/job/foo.svg', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader(
    'Location',
    '/jenkins/build/https/updates.jenkins-ci.org/job/foo.svg'
  )

t.create('jenkins shorthand')
  .get('jenkins/s/https/updates.jenkins-ci.org/job/foo.svg', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader(
    'Location',
    '/jenkins/build/https/updates.jenkins-ci.org/job/foo.svg'
  )
