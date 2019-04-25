'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'JenkinsTestsRedirector',
  title: 'JenkinsTestsRedirector',
  pathPrefix: '/jenkins',
}))

t.create('Tests')
  .get(
    '/t/https/jenkins.qa.ubuntu.com/view/Trusty/view/Smoke Testing/job/trusty-touch-flo-smoke-daily.svg',
    {
      followRedirect: false,
    }
  )
  .expectStatus(301)
  .expectHeader(
    'Location',
    '/jenkins/tests/https/jenkins.qa.ubuntu.com/view/Trusty/view/Smoke Testing/job/trusty-touch-flo-smoke-daily.svg'
  )
