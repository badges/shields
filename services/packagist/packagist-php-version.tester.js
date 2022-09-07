import { isComposerVersion } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create(
  'redirect getting required php version for the dependency from packagist (valid, package version not specified in request)'
)
  .get('/symfony/symfony.json')
  .expectRedirect(
    '/pypi/frameworkversions/django/djangorestframework/3.7.3.json'
  )

t.create(
  'redirect supported django versions (valid, no package version specified)'
)
  .get('/djangorestframework.json')
  .expectRedirect('/pypi/frameworkversions/django/djangorestframework.json')

t.create('redirect supported django versions (no versions specified)')
  .get('/django/1.11.json')
  .expectRedirect('/pypi/frameworkversions/django/django/1.11.json')

t.create('redirect supported django versions (invalid)')
  .get('/not-a-package.json')
  .expectRedirect('/pypi/frameworkversions/django/not-a-package.json')

t.create('gets the package version of symfony')
  .get('/symfony/symfony.json')
  .expectBadge({ label: 'php', message: isComposerVersion })

t.create('gets the package version of symfony 5.2.3')
  .get('/symfony/symfony/v5.2.3.json')
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
