import Joi from 'joi'
import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'GreasyForkRating',
  title: 'Greasy Fork Rating',
  pathPrefix: '/greasyfork',
})

t.create('Rating Count')
  .get('/rating-count/407466.json')
  .expectBadge({
    label: 'rating',
    message: Joi.string().regex(/^\d+?\stotal$/),
  })

t.create('Rating Count (not found)')
  .get('/rating-count/000000.json')
  .expectBadge({ label: 'rating', message: 'not found' })
