import { isSemver } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('version')
  .get('/v/MoveStdlib.json')
  .expectBadge({ label: 'Movey.Net', message: isSemver })

t.create('version (not found)')
  .get('/v/not-a-real-package.json')
  .expectBadge({ label: 'Movey.Net', message: 'package not found' })
