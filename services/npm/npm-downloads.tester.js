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

t.create('downloads in last 18 months of left-pad')
  .get('/d18m/left-pad.json')
  .expectBadge({
    label: 'downloads',
    message: isMetric,
    color: 'brightgreen',
  })

t.create('downloads in last 18 months of @cycle/core')
  .get('/d18m/@cycle/core.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('downloads of unknown package')
  .get('/dy/npm-api-does-not-have-this-package.json')
  .expectBadge({
    label: 'downloads',
    message: 'package not found or too new',
    color: 'red',
  })

t.create('Total downloads redirect: unscoped package')
  .get('/dt/left-pad.svg')
  .expectRedirect('/npm/d18m/left-pad.svg')

t.create('Total downloads redirect: scoped package')
  .get('/dt/@cycle/core.svg')
  .expectRedirect('/npm/d18m/@cycle/core.svg')
