import { isSemver } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('gets the package version of zeromq')
  .get('/zeromq.json')
  .expectBadge({ label: 'conan', message: isSemver })
