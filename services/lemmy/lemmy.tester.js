import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('get community subscribers')
  .get('/community@DUMMY.dumb.json')
  .intercept(nock =>
    nock('https://DUMMY.dumb/')
      .get('/api/v3/community?name=community%40DUMMY.dumb')
      .reply(
        200,
        JSON.stringify({
          community_view: {
            counts: {
              subscribers: 42,
              posts: 0,
              comments: 0,
            },
          },
        }),
      ),
  )
  .expectBadge({
    label: 'subscribe to community@DUMMY.dumb',
    message: '42',
    color: 'brightgreen',
  })

t.create('bad server or connection')
  .get('/community@DUMMY.dumb.json')
  .networkOff()
  .expectBadge({
    label: 'community',
    message: 'inaccessible',
    color: 'lightgrey',
  })

t.create('unknown community')
  .get('/community@DUMMY.dumb.json')
  .intercept(nock =>
    nock('https://DUMMY.dumb/')
      .get('/api/v3/community?name=community%40DUMMY.dumb')
      .reply(
        404,
        JSON.stringify({
          error: 'couldnt_find_community',
        }),
      ),
  )
  .expectBadge({
    label: 'community',
    message: 'community not found',
    color: 'red',
  })

t.create('invalid community').get('/ALIASDUMMY.dumb.json').expectBadge({
  label: 'community',
  message: 'invalid community',
  color: 'red',
})

t.create('test on real lemmy room for API compliance')
  .get('/asklemmy@lemmy.ml.json')
  .timeout(10000)
  .expectBadge({
    label: 'subscribe to asklemmy@lemmy.ml',
    message: Joi.string().regex(/^[0-9]+k$/),
    color: 'brightgreen',
  })
