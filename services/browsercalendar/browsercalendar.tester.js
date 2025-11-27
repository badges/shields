import Joi from 'joi'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

// Version format: "131.0.0 ✓" or "26.1 ✓" (Safari may have 2 parts)
const isVersionStatus = Joi.string().regex(/^\d+(\.\d+)+\s[✓✗]$/)

t.create('Chrome compatibility check')
  .get('/chrome/^130.0.0.json')
  .expectBadge({
    label: 'Chrome',
    message: isVersionStatus,
  })

t.create('Firefox compatibility check')
  .get('/firefox/^100.0.0.json')
  .expectBadge({
    label: 'Firefox',
    message: isVersionStatus,
  })

t.create('Edge compatibility check').get('/edge/^100.0.0.json').expectBadge({
  label: 'Edge',
  message: isVersionStatus,
})

t.create('Safari compatibility check')
  .get('/safari/^17.0.0.json')
  .expectBadge({
    label: 'Safari',
    message: isVersionStatus,
  })
