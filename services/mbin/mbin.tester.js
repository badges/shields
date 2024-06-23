import Joi from 'joi'
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
  .get('/magazine@instance.tld.json')
  .intercept(nock =>
    nock('https://instance.tld/')
      .get('/api/magazine/name/magazine')
      .reply(
        404,
        JSON.stringify({
          error: 'couldnt_find_magazine',
        }),
      ),
  )
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
  .timeout(10000)
  .expectBadge({
    label: 'subscribe to teletext@fedia.io',
    message: Joi.string().regex(/^[0-9]+$/),
    color: 'brightgreen',
  })
