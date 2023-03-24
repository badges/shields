import { createServiceTester } from '../tester.js'
import { withRegex } from '../test-validators.js'

export const t = await createServiceTester()

t.create('Last Update')
  .get('/jmp/MiniMOTD.json')
  .expectBadge({
    label: 'last update',
    message: withRegex(/ago/i),
  })

t.create('Last Update (not found)')
  .get('/GeyserMC/not-existing.json')
  .expectBadge({ label: 'last update', message: 'not found', color: 'red' })
