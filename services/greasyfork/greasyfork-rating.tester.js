import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Rating Count')
  .get('/406540.json')
  .expectBadge({
    label: 'rating',
    message: Joi.string().regex(/^\d+ good, \d+ ok, \d+ bad$/),
  })

t.create('Rating Count (not found)')
  .get('/000000.json')
  .expectBadge({ label: 'rating', message: 'not found' })
