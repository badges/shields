import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'GithubWorkflowStatus',
  title: 'Github Workflow Status',
  pathPrefix: '/github/workflow/status',
})

t.create('no longer available (previously nonexistent repo)')
  .get('/badges/shields-fakeness/fake.json')
  .expectBadge({
    label: 'build',
    message: 'https://github.com/badges/shields/issues/8671',
  })

t.create('no longer available (previously nonexistent workflow)')
  .get('/actions/toolkit/not-a-real-workflow.json')
  .expectBadge({
    label: 'build',
    message: 'https://github.com/badges/shields/issues/8671',
  })

t.create('no longer available (previously valid workflow)')
  .get('/actions/toolkit/toolkit-unit-tests.json')
  .expectBadge({
    label: 'build',
    message: 'https://github.com/badges/shields/issues/8671',
  })

t.create('no longer available (previously valid workflow - branch)')
  .get('/actions/toolkit/toolkit-unit-tests/master.json')
  .expectBadge({
    label: 'build',
    message: 'https://github.com/badges/shields/issues/8671',
  })

t.create('no longer available (previously valid workflow - event)')
  .get('/actions/toolkit/toolkit-unit-tests.json?event=push')
  .expectBadge({
    label: 'build',
    message: 'https://github.com/badges/shields/issues/8671',
  })
