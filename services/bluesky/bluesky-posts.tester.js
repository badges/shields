import Joi from 'joi'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('Posts (live)')
  .get('/chitvs.bsky.social.json')
  .expectBadge({
    label: 'posts',
    message: Joi.string().regex(/^\d+(\.\d+)?[kM]?$/),
  })

t.create('User not found')
  .get('/this-user-should-not-exist-xyz123.json')
  .expectBadge({
    label: 'posts',
    message: Joi.allow('user not found', 'invalid'),
  })

t.create('Handles valid numeric response')
  .get('/mocked-user.json')
  .intercept(nock =>
    nock('https://public.api.bsky.app')
      .get('/xrpc/app.bsky.actor.getProfile')
      .query({ actor: 'mocked-user' })
      .reply(200, { postsCount: 4321 }),
  )
  .expectBadge({
    label: 'posts',
    message: '4.3k',
    color: 'blue',
  })
