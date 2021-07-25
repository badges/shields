import { isIntegerPercentage } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('semver stability (valid)').get('/bundler/puma.json').expectBadge({
  label: 'semver stability',
  message: isIntegerPercentage,
})

t.create('semver stability (invalid error)')
  .get('/invalid-manager/puma.json')
  .expectBadge({
    label: 'semver stability',
    message: 'invalid',
    color: 'lightgrey',
  })

t.create('semver stability (missing dependency)')
  .get('/bundler/some-random-missing-dependency.json')
  .expectBadge({
    label: 'semver stability',
    message: 'unknown',
  })
