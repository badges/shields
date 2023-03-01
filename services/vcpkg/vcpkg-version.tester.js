import { isSemver } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('gets nlohmann-json port version')
  .get('/nlohmann-json.json')
  .expectBadge({ label: 'vcpkg', color: 'blue', message: isSemver })

t.create('gets not found error for invalid port')
  .get('/this-port-does-not-exist.json')
  .expectBadge({
    label: 'vcpkg',
    color: 'red',
    message: 'port not found',
  })
