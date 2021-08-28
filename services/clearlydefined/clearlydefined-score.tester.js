import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('ClearlyDefined Score')
  .get('/score/npm/npmjs/-/jquery/3.4.1/score.json')
  .expectBadge({
    label: 'score',
    message: Joi.string().regex(/^\d\/\d$/),
  })

t.create('ClearlyDefined Score (not found)')
  .get('/score/npm/npmjs/-/not-a-real-package/0.0.0/score.json')
  .expectBadge({
    label: '404',
    message: 'not found',
  })
