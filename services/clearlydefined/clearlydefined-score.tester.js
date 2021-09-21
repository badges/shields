import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('ClearlyDefined Score')
  .get('/score/npm/npmjs/-/jquery/3.4.1.json')
  .expectBadge({
    label: 'score',
    message: Joi.string().regex(/^\d+\/\d+$/),
  })

t.create('ClearlyDefined Score (name not found)')
  .get('/score/npm/npmjs/-/not-a-real-package/0.0.0.json')
  .expectBadge({
    label: 'score',
    message: 'unknown namespace, name, or revision',
  })

t.create('ClearlyDefined Score (type not found)')
  .get('/score/abc/xyz/-/not-a-real-package/0.0.0.json')
  .expectBadge({
    label: 'score',
    message: 'unknown type, provider, or upstream issue',
  })
