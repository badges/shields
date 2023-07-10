import { createServiceTester } from '../tester.js'
import { isOrdinalNumber, isOrdinalNumberDaily } from '../test-validators.js'
export const t = await createServiceTester()

t.create('total rank (valid)').get('/rt/rspec-puppet-facts.json').expectBadge({
  label: 'rank',
  message: isOrdinalNumber,
})

t.create('daily rank (valid)').get('/rd/rails.json').expectBadge({
  label: 'rank',
  message: isOrdinalNumberDaily,
})

t.create('rank (not found)')
  .get('/rt/not-a-package.json')
  .expectBadge({ label: 'rank', message: 'not found' })

t.create('rank is null')
  .get('/rd/rails.json')
  .intercept(nock =>
    nock('http://bestgems.org')
      .get('/api/v1/gems/rails/daily_ranking.json')
      .reply(200, [
        {
          date: '2019-01-06',
          daily_ranking: null,
        },
      ]),
  )
  .expectBadge({ label: 'rank', message: 'invalid rank' })
