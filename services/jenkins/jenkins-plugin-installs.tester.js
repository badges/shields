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

t.create('version installs | valid: numeric version')
  .get('/view-job-filters/1.26.json')
  .expectBadge({
    label: 'installs@1.26',
    message: isMetric,
  })

t.create('version installs | valid: alphanumeric version')
  .get('/build-failure-analyzer/1.17.2-DRE3.14.json')
  .expectBadge({
    label: 'installs@1.17.2-DRE3.14',
    message: isMetric,
  })

t.create('version installs | not found: non-existent plugin')
  .get('/not-a-plugin/1.26.json')
  .expectBadge({ label: 'installs', message: 'plugin not found' })

t.create('version installs | not found: non-existent version')
  .get('/view-job-filters/1.1-NOT-FOUND.json')
  .expectBadge({ label: 'installs', message: 'version not found' })
