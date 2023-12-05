import { isMetricOverTimePeriod, isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('weekly downloads of npm author dukeluo')
  .get('/dw/dukeluo.json')
  .expectBadge({
    label: 'downloads',
    message: isMetricOverTimePeriod,
    color: 'brightgreen',
  })

t.create('monthly downloads of npm author dukeluo')
  .get('/dm/dukeluo.json')
  .expectBadge({
    label: 'downloads',
    message: isMetricOverTimePeriod,
    color: 'brightgreen',
  })

t.create('yearly downloads of npm author dukeluo')
  .get('/dy/dukeluo.json')
  .expectBadge({
    label: 'downloads',
    message: isMetricOverTimePeriod,
    color: 'brightgreen',
  })

t.create('total downloads of npm author dukeluo')
  .get('/dt/dukeluo.json')
  .expectBadge({
    label: 'downloads',
    message: isMetric,
    color: 'brightgreen',
  })

t.create('downloads of unknown npm package author')
  .get('/dt/npm-api-does-not-have-this-package-author.json')
  .expectBadge({
    label: 'downloads',
    message: '0',
    color: 'red',
  })
