import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'JenkinsBuildRedirect',
  title: 'JenkinsBuildRedirect',
  pathPrefix: '/',
})

t.create('old jenkins ci prefix + job url in path')
  .get('jenkins-ci/s/https/updates.jenkins-ci.org/job/foo.svg')
  .expectRedirect(
    `/jenkins/build.svg?jobUrl=${encodeURIComponent(
      'https://updates.jenkins-ci.org/job/foo'
    )}`
  )

t.create('old jenkins shorthand prefix + job url in path')
  .get('jenkins/s/https/updates.jenkins-ci.org/job/foo.svg')
  .expectRedirect(
    `/jenkins/build.svg?jobUrl=${encodeURIComponent(
      'https://updates.jenkins-ci.org/job/foo'
    )}`
  )

t.create('new jenkins build prefix + job url in path')
  .get('jenkins/build/https/updates.jenkins-ci.org/job/foo.svg')
  .expectRedirect(
    `/jenkins/build.svg?jobUrl=${encodeURIComponent(
      'https://updates.jenkins-ci.org/job/foo'
    )}`
  )
