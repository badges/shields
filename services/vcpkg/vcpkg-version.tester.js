import { isSemver } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('gets the port version of entt')
  .get('/entt.json')
  .expectBadge({ label: 'vcpkg', message: isSemver })

t.create('returns not found for invalid port')
  .get('/this-port-does-not-exist.json')
  .expectBadge({
    label: 'vcpkg',
    color: 'red',
    message: 'port not found',
  })
