import Joi from 'joi'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

// Version format: "131.0.0 ✓" or "131.0.0 ✗"
const isVersionStatus = Joi.string().regex(/^\d+\.\d+\.\d+ [✓✗]$/)

t.create('Chrome compatibility check')
  .get('/chrome/<=200.0.0.json')
  .expectBadge({
    label: 'Chrome',
    message: isVersionStatus,
  })

t.create('Firefox compatibility check')
  .get('/firefox/>=100.0.0.json')
  .expectBadge({
    label: 'Firefox',
    message: isVersionStatus,
  })

t.create('Edge compatibility check')
  .get('/edge/<=200.0.0.json')
  .expectBadge({
    label: 'Edge',
    message: isVersionStatus,
  })

t.create('Safari compatibility check')
  .get('/safari/>=17.0.0.json')
  .expectBadge({
    label: 'Safari',
    message: isVersionStatus,
  })
