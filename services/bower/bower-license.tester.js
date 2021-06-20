import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('licence')
  .timeout(10000)
  .get('/bootstrap.json')
  .expectBadge({ label: 'license', message: 'MIT' })

t.create('license not declared')
  .get('/bootstrap.json')
  .intercept(nock =>
    nock('https://libraries.io')
      .get('/api/bower/bootstrap')
      .reply(200, { normalized_licenses: [] })
  )
  .expectBadge({ label: 'license', message: 'missing' })

t.create('licence for Invalid Package')
  .timeout(10000)
  .get('/it-is-a-invalid-package-should-error.json')
  .expectBadge({ label: 'license', message: 'package not found' })
