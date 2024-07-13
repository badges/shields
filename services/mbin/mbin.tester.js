import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('get magazine subscribers')
  .get('/magazine@instance.tld.json')
  .intercept(nock =>
    nock('https://instance.tld/')
      .get('/api/magazine/name/magazine')
      .reply(
        200,
        JSON.stringify({
          subscriptionsCount: 42,
        }),
      ),
  )
  .expectBadge({
    label: 'subscribe to magazine@instance.tld',
    message: '42',
    color: 'brightgreen',
  })

t.create('unknown community')
  .get('/01J12N2ETYG3W5B6G8Y11F5EXG@fedia.io.json')
  .expectBadge({
    label: 'magazine',
    message: 'magazine not found',
    color: 'red',
  })

t.create('invalid magazine').get('/magazine.invalid.json').expectBadge({
  label: 'magazine',
  message: 'invalid magazine',
  color: 'red',
})

t.create('test on real mbin magazine for API compliance')
  .get('/teletext@fedia.io.json')
  .expectBadge({
    label: 'subscribe to teletext@fedia.io',
    message: isMetric,
    color: 'brightgreen',
  })
