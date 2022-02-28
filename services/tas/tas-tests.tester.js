import { createServiceTester } from '../tester.js'
import {
  isDefaultTestTotals,
  isCustomTestTotals,
  isCustomCompactTestTotals,
} from '../test-validators.js'

export const t = await createServiceTester()

const tasBaseUri = `https://api.tas.lambdatest.com/repo/badge`

const mockStat = {
  badge: {
    status: 'passed',
    total_tests: 40,
    passed: 36,
    failed: 1,
    skipped: 2,
  },
}

t.create('Test status')
  .get('/github/tasdemo/demo.json')
  .intercept(nock =>
    nock(tasBaseUri)
      .get('?git_provider=github&org=tasdemo&repo=demo')
      .reply(200, mockStat)
  )
  .expectBadge({ label: 'tests', message: isDefaultTestTotals })

t.create('Test status with custom labels')
  .get('/github/tasdemo/demo.json', {
    qs: {
      passed_label: 'good',
      failed_label: 'bad',
      skipped_label: 'n/a',
    },
  })
  .intercept(nock =>
    nock(tasBaseUri)
      .get('?git_provider=github&org=tasdemo&repo=demo')
      .reply(200, mockStat)
  )
  .expectBadge({ label: 'tests', message: isCustomTestTotals })

t.create('Test status with compact message and custom labels')
  .get('/github/tasdemo/demo.json', {
    qs: {
      compact_message: null,
      passed_label: '💃',
      failed_label: '🤦‍♀️',
      skipped_label: '🤷',
    },
  })
  .intercept(nock =>
    nock(tasBaseUri)
      .get('?git_provider=github&org=tasdemo&repo=demo')
      .reply(200, mockStat)
  )
  .expectBadge({
    label: 'tests',
    message: isCustomCompactTestTotals,
  })

t.create('Test status on project that does not exist')
  .get('/github/tasdemo/doesntexist.json')
  .intercept(nock =>
    nock(tasBaseUri)
      .get('?git_provider=github&org=tasdemo&repo=doesntexist')
      .reply(404, {})
  )
  .expectBadge({
    label: 'tests',
    message: 'project not found',
    color: 'red',
  })

t.create('Test status on private project')
  .get('/github/tasdemo/private.json')
  .intercept(nock =>
    nock(tasBaseUri)
      .get('?git_provider=github&org=tasdemo&repo=private')
      .reply(401, {})
  )
  .expectBadge({
    label: 'tests',
    message: 'private project not supported',
    color: 'lightgrey',
  })
