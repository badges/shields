import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const isOrdinalNumber = Joi.string().regex(/^[1-9][0-9]+(ᵗʰ|ˢᵗ|ⁿᵈ|ʳᵈ)$/)
const isOrdinalNumberDaily = Joi.string().regex(
  /^[1-9][0-9]*(ᵗʰ|ˢᵗ|ⁿᵈ|ʳᵈ) daily$/
)

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
      ])
  )
  .expectBadge({ label: 'rank', message: 'invalid rank' })
