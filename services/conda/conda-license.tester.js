import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('license')
  .get('/l/conda-forge/setuptools.json')
  .expectBadge({ label: 'license', message: 'MIT', color: 'green' })

t.create('license (invalid)')
  .get('/l/conda-forge/some-bogus-package-that-never-exists.json')
  .expectBadge({ label: 'license', message: 'not found', color: 'red' })
