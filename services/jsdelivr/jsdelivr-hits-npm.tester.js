import Joi from 'joi'
import {
  isMetricOverTimePeriod,
  isZeroOverTimePeriod,
} from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const isDownloadsOverTimePeriod = Joi.alternatives().try(
  isMetricOverTimePeriod,
  isZeroOverTimePeriod
)

t.create('jquery hits/day').timeout(10000).get('/hd/ky.json').expectBadge({
  label: 'jsdelivr',
  message: isDownloadsOverTimePeriod,
})

t.create('jquery hits/week').timeout(10000).get('/hw/ky.json').expectBadge({
  label: 'jsdelivr',
  message: isDownloadsOverTimePeriod,
})

t.create('jquery hits/month').timeout(10000).get('/hm/ky.json').expectBadge({
  label: 'jsdelivr',
  message: isMetricOverTimePeriod,
})

t.create('jquery hits/year').timeout(25000).get('/hy/ky.json').expectBadge({
  label: 'jsdelivr',
  message: isMetricOverTimePeriod,
})

t.create('fake package')
  .timeout(10000)
  .get('/hd/somefakepackage.json')
  .expectBadge({
    label: 'jsdelivr',
    // Will return 0 hits/day as the endpoint can't send 404s at present.
    message: '0/day',
  })

t.create('scoped package')
  .timeout(10000)
  .get('/hm/@angular/fire.json')
  .expectBadge({
    label: 'jsdelivr',
    message: isMetricOverTimePeriod,
  })
