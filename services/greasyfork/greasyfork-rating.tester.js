import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Rating Count')
  .get('/rating-count/407466.json')
  .expectBadge({
    label: 'rating',
    message: Joi.string().regex(/^\d+ good, \d+ ok, \d+ bad$/),
  })

t.create('Rating Count (not found)')
  .get('/rating-count/000000.json')
  .expectBadge({ label: 'rating', message: 'not found' })
