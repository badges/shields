import Joi from 'joi'
import { isStarRating } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Score')
  .get('/score/npm/npmjs/-/jquery/3.4.1/jquery.json')
  .expectBadge({
    label: 'ClearlyDefined',
    message: Joi.string().regex(/^\d\/\d$/),
  })

t.create('Score (not found)')
.get('/score/npm/npmjs/-/not-found/0.0.0/not-found.json')
  .expectBadge({
    label: 'ClearlyDefined',
    message: 'not found',
  })
