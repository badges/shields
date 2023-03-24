import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'

export const t = await createServiceTester()

t.create('Watchers')
  .get('/GeyserMC/Geyser.json')
  .expectBadge({ label: 'watchers', message: isMetric })

t.create('Watchers (not found)')
  .get('/GeyserMC/Rorys-Mod.json')
  .expectBadge({ label: 'watchers', message: 'not found', color: 'red' })
