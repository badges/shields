import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Nucleus (pluginId nucleus)').get('/nucleus.json').expectBadge({
  label: 'downloads',
  message: isMetric,
})

t.create('Invalid Plugin (pluginId 1)').get('/1.json').expectBadge({
  label: 'downloads',
  message: 'not found',
})
