import { isPercentage } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('PingPong: Uptime (valid)')
  .get('/sp_eb705b7c189f42e3b574dc790291c33f.json')
  .expectBadge({ label: 'uptime', message: isPercentage })

t.create('PingPong: Uptime (valid, incorrect format)')
  .get('/eb705b7c189f42e3b574dc790291c33f.json')
  .expectBadge({ label: 'uptime', message: 'invalid api key' })
