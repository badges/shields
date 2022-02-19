import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('grade of https://shields.io')
  .timeout(15000)
  .get('/security-headers.json?url=https://shields.io')
  .expectBadge({ label: 'security headers', message: 'F', color: 'red' })

t.create('grade of https://httpstat.us/301 as redirect')
  .timeout(15000)
  .get('/security-headers.json?ignoreRedirects&url=https://httpstat.us/301')
  .expectBadge({ label: 'security headers', message: 'R', color: 'blue' })
