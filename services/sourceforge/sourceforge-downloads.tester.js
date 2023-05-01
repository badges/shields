import { isMetric, isMetricOverTimePeriod } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('total downloads').get('/dt/sevenzip.json').expectBadge({
  label: 'downloads',
  message: isMetric,
})

t.create('total downloads (with subdirs)')
  .get('/dt/smartmontools/smartmontools/7.1.json')
  .expectBadge({
    label: 'downloads',
    message: isMetric,
  })

t.create('monthly downloads').get('/dm/sevenzip.json').expectBadge({
  label: 'downloads',
  message: isMetricOverTimePeriod,
})

t.create('weekly downloads').get('/dw/sevenzip.json').expectBadge({
  label: 'downloads',
  message: isMetricOverTimePeriod,
})

t.create('daily downloads').get('/dd/sevenzip.json').expectBadge({
  label: 'downloads',
  message: isMetricOverTimePeriod,
})

t.create('downloads folder').get('/dm/arianne/stendhal.json').expectBadge({
  label: 'downloads',
  message: isMetricOverTimePeriod,
})

t.create('invalid project').get('/dd/invalid.json').expectBadge({
  label: 'sourceforge',
  message: 'project not found',
})
