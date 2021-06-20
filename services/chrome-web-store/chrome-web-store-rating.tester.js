import Joi from 'joi'
import { isStarRating } from '../test-validators.js'
import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'ChromeWebStoreRating',
  title: 'Chrome Web Store Rating',
  pathPrefix: '/chrome-web-store',
})

t.create('Rating')
  .get('/rating/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .expectBadge({
    label: 'rating',
    message: Joi.string().regex(/^\d\.?\d+?\/5$/),
  })

t.create('Rating (not found)')
  .get('/rating/invalid-name-of-addon.json')
  .expectBadge({ label: 'rating', message: 'not found' })

t.create('Rating Count')
  .get('/rating-count/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .expectBadge({
    label: 'rating',
    message: Joi.string().regex(/^\d+?\stotal$/),
  })

t.create('Rating Count (not found)')
  .get('/rating-count/invalid-name-of-addon.json')
  .expectBadge({ label: 'rating', message: 'not found' })

t.create('Stars')
  .get('/stars/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .expectBadge({ label: 'rating', message: isStarRating })

t.create('Stars (not found)')
  .get('/stars/invalid-name-of-addon.json')
  .expectBadge({ label: 'rating', message: 'not found' })

// Keep this "inaccessible" test, since this service does not use BaseService#_request.
t.create('Rating (inaccessible)')
  .get('/rating/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .networkOff()
  .expectBadge({ label: 'rating', message: 'inaccessible' })
