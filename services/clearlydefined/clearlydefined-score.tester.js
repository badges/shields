import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('ClearlyDefined Score')
  .get('/score/npm/npmjs/-/jquery/3.4.1.json')
  .expectBadge({
    label: 'score',
    message: Joi.string().regex(/^\d+\/\d+$/),
  })

t.create('ClearlyDefined Score (package not found)')
  .get('/score/npm/npmjs/-/not-a-real-package/0.0.0.json')
  .expectBadge({
    label: 'score',
    message: '0/100',
  })

t.create('ClearlyDefined Score (type not found)')
  .get('/score/abc/xyz/-/not-a-real-package/0.0.0.json')
  .expectBadge({
    label: 'score',
    message: 'not found',
  })
