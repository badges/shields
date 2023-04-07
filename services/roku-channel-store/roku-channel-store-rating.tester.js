import Joi from 'joi'
import { isStarRating } from '../test-validators.js'
import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'RokuChannelStoreRating',
  title: 'Roku Channel Store Rating',
  pathPrefix: '/roku-channel-store',
})

t.create('Rating')
  .get('/rating/cca8151de08451c477c322d5e27cea3d.json')
  .expectBadge({
    label: 'rating',
    message: Joi.string().regex(/^\d\.?\d+?\/5$/),
  })

t.create('Rating (Channel not found)')
  .get('/rating/invalid-id-of-channel.json')
  .expectBadge({ label: 'rating', message: 'Channel not found' })

t.create('Rating Count')
  .get('/rating-count/cca8151de08451c477c322d5e27cea3d.json')
  .expectBadge({
    label: 'rating',
    message: Joi.string().regex(/^\d+?k?\stotal$/),
  })

t.create('Rating Count (Channel not found)')
  .get('/rating-count/invalid-id-of-channel.json')
  .expectBadge({ label: 'rating', message: 'Channel not found' })

t.create('Stars')
  .get('/rating-stars/cca8151de08451c477c322d5e27cea3d.json')
  .expectBadge({ label: 'rating', message: isStarRating })

t.create('Stars (Channel not found)')
  .get('/rating-stars/invalid-id-of-channel.json')
  .expectBadge({ label: 'rating', message: 'Channel not found' })
