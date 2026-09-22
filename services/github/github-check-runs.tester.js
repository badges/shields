import { createServiceTester } from '../tester.js'
import { isBuildStatus } from '../build-status.js'
export const t = await createServiceTester()

t.create('check runs - for branch')
  .get('/badges/shields/master.json')
  .expectBadge({
    label: 'checks',
    message: isBuildStatus,
  })

t.create('check runs - name filter (existing check)')
  .get('/badges/shields/master.json?nameFilter=test-lint')
  .expectBadge({
    label: 'checks',
    message: isBuildStatus,
  })

t.create('check runs - name filter (nonexistent check)')
  .get('/badges/shields/master.json?nameFilter=this-check-does-not-exist')
  .expectBadge({
    label: 'checks',
    message: 'no check runs',
  })

t.create('check runs - name filter is forwarded as check_name')
  .get('/badges/shields/master.json?nameFilter=test-lint')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/badges/shields/commits/master/check-runs')
      .query({ check_name: 'test-lint' })
      .reply(200, {
        total_count: 1,
        check_runs: [
          {
            name: 'test-lint',
            status: 'completed',
            conclusion: 'success',
          },
        ],
      }),
  )
  .expectBadge({
    label: 'checks',
    message: 'passing',
    color: 'brightgreen',
  })

t.create('check runs - no tests')
  .get('/badges/shields/5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c.json')
  .expectBadge({
    label: 'checks',
    message: 'no check runs',
  })

t.create('check runs - nonexistent ref')
  .get('/badges/shields/this-ref-does-not-exist.json')
  .expectBadge({
    label: 'checks',
    message: 'ref or repo not found',
  })
