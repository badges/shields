import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'JenkinsCoverageRedirector',
  title: 'JenkinsCoverageRedirector',
  pathPrefix: '/jenkins',
})

t.create('old Jacoco prefix + job url in path')
  .get(
    '/j/https/wso2.org/jenkins/view/All%20Builds/job/sonar/job/sonar-carbon-dashboards.json',
  )
  .expectBadge({
    label: 'jenkins',
    message: 'https://github.com/badges/shields/pull/11583',
  })

t.create('new Jacoco prefix + job url in path')
  .get(
    '/coverage/jacoco/https/wso2.org/jenkins/view/All%20Builds/job/sonar/job/sonar-carbon-dashboards.json',
  )
  .expectBadge({
    label: 'jenkins',
    message: 'https://github.com/badges/shields/pull/11583',
  })

t.create('old Cobertura prefix + job url in path')
  .get('/c/https/jenkins.sqlalchemy.org/job/alembic_coverage.json')
  .expectBadge({
    label: 'jenkins',
    message: 'https://github.com/badges/shields/pull/11583',
  })

t.create('new Cobertura prefix + job url in path')
  .get(
    '/coverage/cobertura/https/jenkins.sqlalchemy.org/job/alembic_coverage.json',
  )
  .expectBadge({
    label: 'jenkins',
    message: 'https://github.com/badges/shields/pull/11583',
  })

t.create('api prefix + job url in path')
  .get(
    '/coverage/api/https/jenkins.library.illinois.edu/job/OpenSourceProjects/job/Speedwagon/job/master.json',
  )
  .expectBadge({
    label: 'jenkins',
    message: 'https://github.com/badges/shields/pull/11583',
  })

t.create('old v1 api prefix to new prefix')
  .get(
    '/coverage/api.json?jobUrl=http://loneraver.duckdns.org:8082/job/github/job/VisVid/job/master',
  )
  .expectBadge({
    label: 'jenkins',
    message: 'https://github.com/badges/shields/pull/11583',
  })
