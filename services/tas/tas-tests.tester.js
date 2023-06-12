import { createServiceTester } from '../tester.js'
import {
  isDefaultTestTotals,
  isCustomTestTotals,
  isCustomCompactTestTotals,
} from '../test-validators.js'

export const t = await createServiceTester()

t.create('Test status')
  .get('/github/tasdemo/axios.json')
  .expectBadge({ label: 'tests', message: isDefaultTestTotals })

t.create('Test status with custom labels')
  .get('/github/tasdemo/axios.json', {
    qs: {
      passed_label: 'good',
      failed_label: 'bad',
      skipped_label: 'n/a',
    },
  })
  .expectBadge({ label: 'tests', message: isCustomTestTotals })

t.create('Test status with compact message and custom labels')
  .get('/github/tasdemo/axios.json', {
    qs: {
      compact_message: null,
      passed_label: '💃',
      failed_label: '🤦‍♀️',
      skipped_label: '🤷',
    },
  })
  .expectBadge({
    label: 'tests',
    message: isCustomCompactTestTotals,
  })

t.create('Test status on project that does not exist')
  .get('/github/tasdemo/doesntexist.json')
  .expectBadge({
    label: 'tests',
    message: 'project not found',
    color: 'red',
  })

t.create('Test status on private project')
  .get('/github/tasdemo/nexe-private.json')
  .intercept(nock =>
    nock('https://api.tas.lambdatest.com')
      .get('/repo/badge')
      .query({
        git_provider: 'github',
        org: 'tasdemo',
        repo: 'nexe-private',
      })
      .reply(401)
  )
  .expectBadge({
    label: 'tests',
    message: 'private project not supported',
    color: 'lightgrey',
  })
