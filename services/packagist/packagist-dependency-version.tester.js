import { isComposerVersion } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('gets the package version of symfony')
  .get('/symfony/symfony.json?dependencyVendor=twig&dependencyRepo=twig')
  .expectBadge({ label: 'twig/twig', message: isComposerVersion })

t.create('gets the package version of symfony 5.2.3')
  .get('/symfony/symfony/v5.2.3.json?dependencyVendor=twig&dependencyRepo=twig')
  .expectBadge({ label: 'twig/twig', message: isComposerVersion })

t.create('package with no requirements')
  .get('/bpampuch/pdfmake.json?dependencyVendor=twig&dependencyRepo=twig')
  .expectBadge({
    label: 'dependency version',
    message: 'version requirement not found',
  })

t.create('package with no twig/twig version requirement')
  .get(
    '/raulfraile/ladybug-theme-modern.json?dependencyVendor=twig&dependencyRepo=twig'
  )
  .expectBadge({
    label: 'dependency version',
    message: 'version requirement not found',
  })

t.create('invalid package name')
  .get('/frodo/is-not-a-package.json?dependencyVendor=twig&dependencyRepo=twig')
  .expectBadge({ label: 'dependency version', message: 'not found' })

t.create('invalid version')
  .get(
    '/symfony/symfony/invalid.json?dependencyVendor=twig&dependencyRepo=twig'
  )
  .expectBadge({ label: 'dependency version', message: 'invalid version' })

t.create('custom server')
  .get(
    '/symfony/symfony.json?server=https%3A%2F%2Fpackagist.org&dependencyVendor=twig&dependencyRepo=twig'
  )
  .expectBadge({ label: 'twig/twig', message: isComposerVersion })

t.create('invalid custom server')
  .get(
    '/symfony/symfony.json?server=https%3A%2F%2Fpackagist.com&dependencyVendor=twig&dependencyRepo=twig'
  )
  .expectBadge({ label: 'dependency version', message: 'not found' })
