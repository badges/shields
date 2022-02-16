import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('licence')
  .timeout(10000)
  .get('/bootstrap.json')
  .expectBadge({ label: 'license', message: 'MIT' })

t.create('licence for Invalid Package')
  .timeout(10000)
  .get('/it-is-a-invalid-package-should-error.json')
  .expectBadge({ label: 'license', message: 'package not found' })
