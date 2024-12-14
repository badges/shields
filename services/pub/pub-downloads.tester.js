import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('pub downloads (valid)').get('/analysis_options.json').expectBadge({
  label: 'downloads',
  message: isMetric,
  color: 'blue',
})

t.create('pub downloads (not found)').get('/analysisoptions.json').expectBadge({
  label: 'downloads',
  message: 'not found',
  color: 'red',
})

t.create('pub downloads (invalid)').get('/analysis-options.json').expectBadge({
  label: 'downloads',
  message: 'invalid',
  color: 'lightgrey',
})
