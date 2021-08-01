import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'JenkinsTestsRedirector',
  title: 'JenkinsTestsRedirector',
  pathPrefix: '/jenkins',
})

t.create('old tests prefix + job url in path')
  .get(
    '/t/https/jenkins.qa.ubuntu.com/view/Trusty/view/Smoke Testing/job/trusty-touch-flo-smoke-daily.svg'
  )
  .expectRedirect(
    `/jenkins/tests.svg?jobUrl=${encodeURIComponent(
      'https://jenkins.qa.ubuntu.com/view/Trusty/view/Smoke Testing/job/trusty-touch-flo-smoke-daily'
    )}`
  )

t.create('new tests prefix + job url in path')
  .get(
    '/tests/https/jenkins.qa.ubuntu.com/view/Trusty/view/Smoke Testing/job/trusty-touch-flo-smoke-daily.svg'
  )
  .expectRedirect(
    `/jenkins/tests.svg?jobUrl=${encodeURIComponent(
      'https://jenkins.qa.ubuntu.com/view/Trusty/view/Smoke Testing/job/trusty-touch-flo-smoke-daily'
    )}`
  )
