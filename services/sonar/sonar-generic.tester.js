import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Security Rating')
  .timeout(10000)
  .get(
    '/security_rating/com.luckybox:luckybox.json?server=https://sonarcloud.io'
  )
  .expectBadge({
    label: 'security rating',
    message: isMetric,
    color: 'blue',
  })

t.create('Security Rating (branch)')
  .timeout(10000)
  .get(
    '/security_rating/com.luckybox:luckybox/master.json?server=https://sonarcloud.io'
  )
  .expectBadge({
    label: 'security rating',
    message: isMetric,
    color: 'blue',
  })
