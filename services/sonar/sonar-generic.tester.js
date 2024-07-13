import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Security Rating')
  .timeout(10000)
  .get('/security_rating/WebExtensions.Net.json?server=https://sonarcloud.io')
  .expectBadge({
    label: 'security rating',
    message: isMetric,
    color: 'blue',
  })

t.create('Security Rating (branch)')
  .timeout(10000)
  .get(
    '/security_rating/WebExtensions.Net/main.json?server=https://sonarcloud.io',
  )
  .expectBadge({
    label: 'security rating',
    message: isMetric,
    color: 'blue',
  })
