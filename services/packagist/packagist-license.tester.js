import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('license (valid)')
  .get('/symfony/symfony.json')
  .expectBadge({ label: 'license', message: 'MIT' })

// note: packagist does serve up license at the version level
// but our endpoint only supports fetching license for the lastest version
t.create('license (invalid, package version in request)')
  .get('/symfony/symfony/v2.8.0.json')
  .expectBadge({ label: '404', message: 'badge not found' })

t.create('license (invalid)')
  .get('/frodo/is-not-a-package.json')
  .expectBadge({ label: 'license', message: 'not found' })

t.create('license (valid custom server)')
  .get('/symfony/symfony.json?server=https%3A%2F%2Fpackagist.org')
  .expectBadge({ label: 'license', message: 'MIT' })

t.create('license (invalid custom server)')
  .get('/symfony/symfony.json?server=https%3A%2F%2Fpackagist.com')
  .expectBadge({ label: 'license', message: 'not found' })
