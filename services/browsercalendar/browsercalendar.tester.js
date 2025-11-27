import Joi from 'joi'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

const isBrowserStatus = Joi.string().regex(/^(Chrome|Firefox|Edge|Safari) [^\s]+$/)

t.create('Chrome compatibility check')
  .get('/chrome/<=200.0.0.json')
  .expectBadge({
    label: 'Chrome',
    message: isBrowserStatus,
  })

t.create('Firefox compatibility check')
  .get('/firefox/>=100.0.0.json')
  .expectBadge({
    label: 'Firefox',
    message: isBrowserStatus,
  })

t.create('Edge compatibility check')
  .get('/edge/<=200.0.0.json')
  .expectBadge({
    label: 'Edge',
    message: isBrowserStatus,
  })

t.create('Safari compatibility check')
  .get('/safari/>=17.0.0.json')
  .expectBadge({
    label: 'Safari',
    message: isBrowserStatus,
  })
