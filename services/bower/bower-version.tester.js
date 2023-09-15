import {
  isVPlusDottedVersionAtLeastOne,
  isVPlusDottedVersionNClausesWithOptionalSuffix,
} from '../test-validators.js'
import { ServiceTester } from '../tester.js'
export const t = new ServiceTester({
  id: 'BowerVersion',
  title: 'Bower Version',
  pathPrefix: '/bower',
})

t.create('version').timeout(10000).get('/v/backbone.json').expectBadge({
  label: 'bower',
  message: isVPlusDottedVersionAtLeastOne,
})

t.create('pre version')
  .timeout(10000)
  .get('/v/angular.json?include_prereleases')
  .expectBadge({
    label: 'bower',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
  })

t.create('Version for Invalid Package')
  .timeout(10000)
  .get('/v/it-is-a-invalid-package-should-error.json')
  .expectBadge({ label: 'bower', message: 'package not found' })

t.create('Pre Version for Invalid Package')
  .timeout(10000)
  .get('/v/it-is-a-invalid-package-should-error.json?include_prereleases')
  .expectBadge({ label: 'bower', message: 'package not found' })
