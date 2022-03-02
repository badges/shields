import { isSemver } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('gets the package version of zeromq')
  .get('/zeromq.json')
  .expectBadge({ label: 'conan', message: isSemver })

t.create('returns not found for invalid package')
  .get('/this package does not exist - shields test.json')
  .expectBadge({
    label: 'conan',
    color: 'red',
    message:
      'repo not found, branch not found, or recipes/this package does not exist - shields test/config.yml missing',
  })
