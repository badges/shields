import { createServiceTester } from '../tester.js'
import { isCurrencyOverTime } from './liberapay-base.js'
export const t = await createServiceTester()

t.create('Giving (valid)').get('/Changaco.json').expectBadge({
  label: 'gives',
  message: isCurrencyOverTime,
})

t.create('Giving (not found)')
  .get('/does-not-exist.json')
  .expectBadge({ label: 'liberapay', message: 'not found' })

t.create('Giving (missing goal key)')
  .get('/Liberapay.json')
  .intercept(nock =>
    nock('https://liberapay.com')
      .get('/Liberapay/public.json')
      .reply(200, {
        npatrons: 0,
        giving: { amount: '3.71', currency: 'EUR' },
        receiving: null,
      })
  )
  .expectBadge({ label: 'gives', message: isCurrencyOverTime })

t.create('Giving (null)')
  .get('/Liberapay.json')
  .intercept(nock =>
    nock('https://liberapay.com').get('/Liberapay/public.json').reply(200, {
      npatrons: 0,
      giving: null,
      receiving: null,
      goal: null,
    })
  )
  .expectBadge({ label: 'liberapay', message: 'no public giving stats' })
