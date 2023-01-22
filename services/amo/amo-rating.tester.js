import Joi from 'joi'
import { isStarRating } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Rating')
  .get('/rating/IndieGala-Helper.json')
  .expectBadge({
    label: 'rating',
    message: Joi.string().regex(/^\d\/\d$/),
  })

t.create('Stars')
  .get('/stars/IndieGala-Helper.json')
  .expectBadge({ label: 'stars', message: isStarRating })

t.create('Rating (not found)')
  .get('/rating/not-a-real-plugin.json')
  .expectBadge({ label: 'mozilla add-on', message: 'not found' })
