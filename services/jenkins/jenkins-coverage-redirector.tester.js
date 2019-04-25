'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'JenkinsCoverageRedirector',
  title: 'JenkinsCoverageRedirector',
  pathPrefix: '/jenkins',
}))

t.create('Jacoco')
  .get(
    '/j/https/wso2.org/jenkins/view/All%20Builds/job/sonar/job/sonar-carbon-dashboards.svg',
    {
      followRedirect: false,
    }
  )
  .expectStatus(301)
  .expectHeader(
    'Location',
    '/jenkins/coverage/jacoco/https/wso2.org/jenkins/view/All Builds/job/sonar/job/sonar-carbon-dashboards.svg'
  )

t.create('Cobertura')
  .get('/c/https/jenkins.sqlalchemy.org/job/alembic_coverage.svg', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader(
    'Location',
    '/jenkins/coverage/cobertura/https/jenkins.sqlalchemy.org/job/alembic_coverage.svg'
  )
