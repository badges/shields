import { createServiceTester } from '../tester.js'
import { withRegex } from '../test-validators.js'

export const t = await createServiceTester()

t.create('Version')
  .get('/jmp/MiniMOTD.json')
  .expectBadge({ label: 'version', message: withRegex(/.*\d+\.\d+(\.d+)?.*/) })

t.create('Version (not found)')
  .get('/not-existing/not-existing.json')
  .expectBadge({ label: 'version', message: 'not found', color: 'red' })
