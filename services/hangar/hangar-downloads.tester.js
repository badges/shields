import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'

export const t = await createServiceTester()

t.create('Downloads')
  .get('/GeyserMC/Geyser/.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('Downloads (not found)')
  .get('/kennytv/kennytv-is-a-unpaid-mojang-intern.json')
  .expectBadge({ label: 'downloads', message: 'not found', color: 'red' })
