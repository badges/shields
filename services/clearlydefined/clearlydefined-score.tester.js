import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('ClearlyDefined Score')
  .get('/score/npm/npmjs/-/jquery/3.4.1.json')
  .expectBadge({
    label: 'score',
    message: Joi.string().regex(/^\d+\/\d+$/),
  })

t.create('ClearlyDefined Score (revision not found)')
  .get('/score/npm/npmjs/-/jquery/999.1.1.json')
  .expectBadge({
    label: 'score',
    message: 'unknown namespace, name, or revision',
  })

t.create('ClearlyDefined Score (name not found)')
  .get('/score/npm/npmjs/-/not-a-real-package/3.4.1.json')
  .expectBadge({
    label: 'score',
    message: 'unknown namespace, name, or revision',
  })

t.create('ClearlyDefined Score (namespace not found)')
  .get('/score/npm/npmjs/not-a-real-namespace/jquery/3.4.1.json')
  .expectBadge({
    label: 'score',
    message: 'unknown namespace, name, or revision',
  })

t.create('ClearlyDefined Score (provider not found)')
  .get('/score/npm/not-a-real-provider/-/jquery/3.4.1.json')
  .expectBadge({
    label: 'score',
    message: 'unknown type, provider, or upstream issue',
  })

t.create('ClearlyDefined Score (type not found)')
  .get('/score/not-a-real-type/npmjs/-/jquery/3.4.1.json')
  .expectBadge({
    label: 'score',
    message: 'unknown type, provider, or upstream issue',
  })
