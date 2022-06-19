import { isVPlusDottedVersionNClausesWithOptionalSuffix } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Nucleus (pluginId nucleus)').get('/nucleus.json').expectBadge({
  label: 'version',
  message: isVPlusDottedVersionNClausesWithOptionalSuffix,
})

t.create('Invalid Plugin (pluginId 1)').get('/1.json').expectBadge({
  label: 'version',
  message: 'not found',
})
