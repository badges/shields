import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Zed Downloads (valid)').get('/react-snippets-es7.json').expectBadge({
  label: 'installs',
  message: isMetric,
})

t.create('Flathub Downloads  (not found)')
  .get('/extension.does.not.exist.json')
  .expectBadge({ label: 'installs', message: 'invalid response data' })
