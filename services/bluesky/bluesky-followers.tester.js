import Joi from 'joi'
import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'

export const t = await createServiceTester()

t.create('Followers (live)').get('/chitvs.bsky.social.json').expectBadge({
  label: 'followers',
  message: isMetric,
})

t.create('User not found')
  .get('/this-user-should-not-exist-xyz123.json')
  .expectBadge({
    label: 'followers',
    message: Joi.allow('user not found'),
  })

t.create('Handles valid numeric response')
  .get('/mocked-user.json')
  .intercept(nock =>
    nock('https://public.api.bsky.app')
      .get('/xrpc/app.bsky.actor.getProfile')
      .query({ actor: 'mocked-user' })
      .reply(200, { followersCount: 9876 }),
  )
  .expectBadge({
    label: 'followers',
    message: '9.9k',
    color: 'blue',
  })
