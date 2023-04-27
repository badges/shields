import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Essentials (project EssentialsX/Essentials)')
  .get('/EssentialsX/Essentials.json')
  .expectBadge({
    label: 'downloads',
    message: isMetric,
  })

t.create('Invalid Project (project md5lukas/invalid)')
  .get('/md5lukas/invalid.json')
  .expectBadge({
    label: 'downloads',
    message: 'not found',
  })
