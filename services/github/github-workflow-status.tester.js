import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'GithubWorkflowStatus',
  title: 'Github Workflow Status',
  pathPrefix: '/github/workflow/status',
})

const depricationExpectedResponse = {
  label: 'githubworkflowstatus',
  message: 'https://github.com/badges/shields/issues/8671',
  link: ['https://github.com/badges/shields/issues/8671'],
  color: 'red',
}

t.create('no longer available (previously nonexistent repo)')
  .get('/badges/shields-fakeness/fake.json')
  .expectBadge(depricationExpectedResponse)

t.create('no longer available (previously nonexistent workflow)')
  .get('/actions/toolkit/not-a-real-workflow.json')
  .expectBadge(depricationExpectedResponse)

t.create('no longer available (previously valid workflow)')
  .get('/actions/toolkit/toolkit-unit-tests.json')
  .expectBadge(depricationExpectedResponse)

t.create('no longer available (previously valid workflow - branch)')
  .get('/actions/toolkit/toolkit-unit-tests/master.json')
  .expectBadge(depricationExpectedResponse)

t.create('no longer available (previously valid workflow - event)')
  .get('/actions/toolkit/toolkit-unit-tests.json?event=push')
  .expectBadge(depricationExpectedResponse)
