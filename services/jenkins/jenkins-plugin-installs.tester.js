import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

// total installs

t.create('total installs | valid').get('/view-job-filters.json').expectBadge({
  label: 'installs',
  message: isMetric,
})

t.create('total installs | not found')
  .get('/not-a-plugin.json')
  .expectBadge({ label: 'installs', message: 'plugin not found' })

// version installs

t.create('version installs | no longer available')
  .get('/view-job-filters/1.26.json')
  .expectBadge({
    label: 'installs',
    message: 'no longer available per version',
    color: 'lightgrey',
  })
