import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'GithubWorkflowStatus',
  title: 'Github Workflow Status',
  pathPrefix: '/github/workflow/status',
})

const expectedDeprecatedResponse = {
  label: 'githubworkflowstatus',
  message: 'https://github.com/badges/shields/issues/8671',
  link: ['https://github.com/badges/shields/issues/8671'],
  color: 'red',
}

t.create('retired badge (previously nonexistent repo)')
  .get('/badges/shields-fakeness/fake.json')
  .expectBadge(expectedDeprecatedResponse)

t.create('retired badge (previously nonexistent workflow)')
  .get('/actions/toolkit/not-a-real-workflow.json')
  .expectBadge(expectedDeprecatedResponse)

t.create('retired badge (previously valid workflow)')
  .get('/actions/toolkit/toolkit-unit-tests.json')
  .expectBadge(expectedDeprecatedResponse)

t.create('retired badge (previously valid workflow - branch)')
  .get('/actions/toolkit/toolkit-unit-tests/master.json')
  .expectBadge(expectedDeprecatedResponse)

t.create('retired badge (previously valid workflow - event)')
  .get('/actions/toolkit/toolkit-unit-tests.json?event=push')
  .expectBadge(expectedDeprecatedResponse)
