import Joi from 'joi'
import { isStarRating } from '../test-validators.js'
import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'EdgeAddOnsRating',
  title: 'Microsoft Edge Add-ons Rating',
  pathPrefix: '/edge-add-ons',
})

t.create('Rating')
  .get('/rating/cnlefmmeadmemmdciolhbnfeacpdfbkd.json')
  .expectBadge({
    label: 'rating',
    message: Joi.string().regex(/^\d(?:\.\d{1,2})?\/5$/),
  })

t.create('Rating (not found)')
  .get('/rating/invalid-name-of-addon.json')
  .expectBadge({ label: 'rating', message: 'not found' })

t.create('Rating Count')
  .get('/rating-count/cnlefmmeadmemmdciolhbnfeacpdfbkd.json')
  .expectBadge({
    label: 'rating',
    message: Joi.string().regex(/^\d+(\.\d)?[kMGTPEZY]? total$/),
  })

t.create('Rating Count (not found)')
  .get('/rating-count/invalid-name-of-addon.json')
  .expectBadge({ label: 'rating', message: 'not found' })

t.create('Stars')
  .get('/stars/cnlefmmeadmemmdciolhbnfeacpdfbkd.json')
  .expectBadge({ label: 'rating', message: isStarRating })

t.create('Stars (not found)')
  .get('/stars/invalid-name-of-addon.json')
  .expectBadge({ label: 'rating', message: 'not found' })
