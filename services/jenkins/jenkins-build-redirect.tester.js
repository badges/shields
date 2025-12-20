import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'JenkinsBuildRedirect',
  title: 'JenkinsBuildRedirect',
  pathPrefix: '/',
})

t.create('old jenkins ci prefix + job url in path')
  .get('jenkins-ci/s/https/updates.jenkins-ci.org/job/foo.json')
  .expectBadge({
    label: 'jenkins',
    message: 'https://github.com/badges/shields/pull/11583',
  })

t.create('old jenkins shorthand prefix + job url in path')
  .get('jenkins/s/https/updates.jenkins-ci.org/job/foo.json')
  .expectBadge({
    label: 'jenkins',
    message: 'https://github.com/badges/shields/pull/11583',
  })

t.create('new jenkins build prefix + job url in path')
  .get('jenkins/build/https/updates.jenkins-ci.org/job/foo.json')
  .expectBadge({
    label: 'jenkins',
    message: 'https://github.com/badges/shields/pull/11583',
  })
