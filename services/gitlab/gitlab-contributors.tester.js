import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'
export const t = await createServiceTester()

t.create('Contributors')
  .get('/guoxudong.io/shields-test/licenced-test.json')
  .expectBadge({
    label: 'contributors',
    message: isMetric,
  })

t.create('Contributors (repo not found)')
  .get('/guoxudong.io/shields-test/do-not-exist.json')
  .expectBadge({
    label: 'contributors',
    message: 'project not found',
  })

t.create('Mocking the missing x-total header')
  .get('/group/project.json')
  .intercept(nock =>
    nock('https://gitlab.com')
      .get(
        '/api/v4/projects/group%2Fproject/repository/contributors?page=1&per_page=1'
      )
      .reply(200)
  )
  .expectBadge({
    label: 'contributors',
    message: 'invalid response data',
  })
