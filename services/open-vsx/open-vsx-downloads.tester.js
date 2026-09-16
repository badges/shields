import { createServiceTester } from '../tester.js'
import { withRegex, isMetric } from '../test-validators.js'
export const t = await createServiceTester()

const isVersionLabel = withRegex(/^downloads@(\d+\.\d+\.\d+)(\.\d+)?$/)

t.create('downloads invalid extension')
  .get('/badges/shields.json')
  .expectBadge({
    label: 'downloads',
    message: 'extension not found',
  })

t.create('downloads').get('/redhat/java.json').expectBadge({
  label: 'downloads',
  message: isMetric,
})

t.create('downloads version').get('/redhat/java/latest.json').expectBadge({
  label: isVersionLabel,
  message: isMetric,
})
