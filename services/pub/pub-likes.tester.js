import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('pub likes (valid)').get('/analysis_options.json').expectBadge({
  label: 'likes',
  message: isMetric,
  color: 'blue',
})

t.create('pub likes (not found)').get('/analysisoptions.json').expectBadge({
  label: 'likes',
  message: 'not found',
  color: 'red',
})

t.create('pub likes (invalid)').get('/analysis-options.json').expectBadge({
  label: 'likes',
  message: 'invalid',
  color: 'lightgrey',
})
