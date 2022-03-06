import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('BedWars1058 Private Games Addon (id 1620)')
  .get('/1620.json')
  .expectBadge({
    label: 'downloads',
    message: isMetric,
  })

t.create('Invalid Resource (id 1)').get('/1.json').expectBadge({
  label: 'downloads',
  message: 'not found',
})
