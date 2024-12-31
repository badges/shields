import { isMetricOverTimePeriod } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('pub monthly downloads (valid)')
  .get('/analysis_options.json')
  .expectBadge({
    label: 'downloads',
    message: isMetricOverTimePeriod,
    color: 'green',
  })

t.create('pub monthly downloads (not found)')
  .get('/analysisoptions.json')
  .expectBadge({
    label: 'downloads',
    message: 'not found',
    color: 'red',
  })

t.create('pub monthly downloads (invalid)')
  .get('/analysis-options.json')
  .expectBadge({
    label: 'downloads',
    message: 'invalid',
    color: 'lightgrey',
  })
