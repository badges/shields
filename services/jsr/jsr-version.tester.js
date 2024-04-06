import { isSemver } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('gets the version of @luca/flag')
  .get('/@luca/flag.json')
  .expectBadge({ label: 'jsr', message: isSemver })

t.create('gets the version of @std/assert')
  .get('/@std/assert.json')
  .expectBadge({ label: 'jsr', message: isSemver })

t.create('returns an error when getting a non-existent')
  .get('/@std/this-is-a-non-existent-package-name.json')
  .expectBadge({ label: 'jsr', message: 'package not found' })
