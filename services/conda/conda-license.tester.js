import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('license')
  .get('/conda-forge/mlforecast.json')
  .expectBadge({ label: 'license', message: 'Apache-2.0', color: 'green' })

t.create('license (invalid)')
  .get('/conda-forge/some-bogus-package-that-never-exists.json')
  .expectBadge({ label: 'license', message: 'not found', color: 'red' })
