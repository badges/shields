import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'

export const t = await createServiceTester()

t.create('Downloads')
  .get('/just-perfection-desktop@just-perfection.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('Downloads (not found)').get('/non-existent.json').expectBadge({
  label: 'downloads',
  message: 'extension not found',
})
