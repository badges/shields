import { isMetricOverTimePeriod, isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('weekly downloads of left-pad').get('/dw/left-pad.json').expectBadge({
  label: 'downloads',
  message: isMetricOverTimePeriod,
  color: 'brightgreen',
})

t.create('weekly downloads of @cycle/core')
  .get('/dw/@cycle/core.json')
  .expectBadge({ label: 'downloads', message: isMetricOverTimePeriod })

t.create('total downloads of left-pad').get('/dt/left-pad.json').expectBadge({
  label: 'downloads',
  message: isMetric,
  color: 'brightgreen',
})

t.create('total downloads of @cycle/core')
  .get('/dt/@cycle/core.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('downloads of unknown package')
  .get('/dt/npm-api-does-not-have-this-package.json')
  .expectBadge({
    label: 'downloads',
    message: 'package not found or too new',
    color: 'red',
  })
