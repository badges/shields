import Joi from 'joi'
import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = createServiceTester()

t.create('fetch: valid npub')
  .get('/npub18c556t7n8xa3df2q82rwxejfglw5przds7sqvefylzjh8tjne28qld0we7.json')
  .expectBadge({
    label: 'followers',
    message: Joi.alternatives().try(isMetric, Joi.equal('invalid pubkey')),
  })

t.create('fetch: invalid npub').get('/invalidnpub.json').expectBadge({
  label: 'followers',
  message: 'invalid pubkey',
})

t.create('handle: valid npub')
  .get('/npub18c556t7n8xa3df2q82rwxejfglw5przds7sqvefylzjh8tjne28qld0we7.json')
  .expectBadge({
    label: 'followers',
    message: Joi.alternatives().try(isMetric, Joi.equal('invalid pubkey')),
  })

t.create('handle: invalid npub').get('/invalidnpub.json').expectBadge({
  label: 'followers',
  message: 'invalid pubkey',
})
