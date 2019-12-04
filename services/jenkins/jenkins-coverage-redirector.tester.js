'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'JenkinsCoverageRedirector',
  title: 'JenkinsCoverageRedirector',
  pathPrefix: '/jenkins',
}))

t.create('old Jacoco prefix + job url in path')
  .get(
    '/j/https/wso2.org/jenkins/view/All%20Builds/job/sonar/job/sonar-carbon-dashboards.svg',
    {
      followRedirect: false,
    }
  )
  .expectStatus(301)
  .expectHeader(
    'Location',
    `/jenkins/coverage/jacoco.svg?jobUrl=${encodeURIComponent(
      'https://wso2.org/jenkins/view/All Builds/job/sonar/job/sonar-carbon-dashboards'
    )}`
  )

t.create('new Jacoco prefix + job url in path')
  .get(
    '/coverage/jacoco/https/wso2.org/jenkins/view/All%20Builds/job/sonar/job/sonar-carbon-dashboards.svg',
    {
      followRedirect: false,
    }
  )
  .expectStatus(301)
  .expectHeader(
    'Location',
    `/jenkins/coverage/jacoco.svg?jobUrl=${encodeURIComponent(
      'https://wso2.org/jenkins/view/All Builds/job/sonar/job/sonar-carbon-dashboards'
    )}`
  )

t.create('old Cobertura prefix + job url in path')
  .get('/c/https/jenkins.sqlalchemy.org/job/alembic_coverage.svg', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader(
    'Location',
    `/jenkins/coverage/cobertura.svg?jobUrl=${encodeURIComponent(
      'https://jenkins.sqlalchemy.org/job/alembic_coverage'
    )}`
  )

t.create('new Cobertura prefix + job url in path')
  .get(
    '/coverage/cobertura/https/jenkins.sqlalchemy.org/job/alembic_coverage.svg',
    {
      followRedirect: false,
    }
  )
  .expectStatus(301)
  .expectHeader(
    'Location',
    `/jenkins/coverage/cobertura.svg?jobUrl=${encodeURIComponent(
      'https://jenkins.sqlalchemy.org/job/alembic_coverage'
    )}`
  )

t.create('api prefix + job url in path')
  .get(
    '/coverage/api/https/jenkins.library.illinois.edu/job/OpenSourceProjects/job/Speedwagon/job/master.svg',
    {
      followRedirect: false,
    }
  )
  .expectStatus(301)
  .expectHeader(
    'Location',
    `/jenkins/coverage/api.svg?jobUrl=${encodeURIComponent(
      'https://jenkins.library.illinois.edu/job/OpenSourceProjects/job/Speedwagon/job/master'
    )}`
  )
