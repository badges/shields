import { isIntegerPercentage } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('pub popularity (valid)').get('/analysis_options.json').expectBadge({
  label: 'popularity',
  message: isIntegerPercentage,
})

t.create('pub popularity (not found)')
  .get('/analysisoptions.json')
  .expectBadge({
    label: 'popularity',
    message: 'not found',
    color: 'red',
  })

t.create('pub popularity (invalid)').get('/analysis-options.json').expectBadge({
  label: 'popularity',
  message: 'invalid',
  color: 'lightgrey',
})
