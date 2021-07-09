import { isComposerVersion } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('gets the package version of symfony')
  .get('/symfony/symfony.json')
  .expectBadge({ label: 'php', message: isComposerVersion })

t.create('gets the package version of symfony 2.8')
  .get('/symfony/symfony/v2.8.0.json')
  .expectBadge({ label: 'php', message: isComposerVersion })

t.create('package with no requirements')
  .get('/bpampuch/pdfmake.json')
  .expectBadge({ label: 'php', message: 'version requirement not found' })

t.create('package with no php version requirement')
  .get('/raulfraile/ladybug-theme-modern.json')
  .expectBadge({ label: 'php', message: 'version requirement not found' })

t.create('invalid package name')
  .get('/frodo/is-not-a-package.json')
  .expectBadge({ label: 'php', message: 'not found' })

t.create('invalid version')
  .get('/symfony/symfony/invalid.json')
  .expectBadge({ label: 'php', message: 'invalid version' })

t.create('custom server')
  .get('/symfony/symfony.json?server=https%3A%2F%2Fpackagist.org')
  .expectBadge({ label: 'php', message: isComposerVersion })

t.create('invalid custom server')
  .get('/symfony/symfony.json?server=https%3A%2F%2Fpackagist.com')
  .expectBadge({ label: 'php', message: 'not found' })
