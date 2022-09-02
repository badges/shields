import { isComposerVersion } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('gets the package version of symfony 5.2.3 - without query params')
  .get('/symfony/symfony/v5.2.3.json')
  .expectBadge({
    label: 'dependency version',
    message: 'dependency vendor or repo not specified',
  })

t.create(
  'gets the package version of symfony - with correct dependencyVendor and dependencyRepo'
)
  .get('/symfony/symfony.json?dependencyVendor=twig&dependencyRepo=twig')
  .expectBadge({ label: 'twig/twig', message: isComposerVersion })

t.create(
  'gets the package version of symfony 5.2.3 - with correct dependencyVendor and dependencyRepo'
)
  .get('/symfony/symfony/v5.2.3.json?dependencyVendor=twig&dependencyRepo=twig')
  .expectBadge({ label: 'twig/twig', message: isComposerVersion })

t.create(
  'gets the package version of symfony 5.2.3 - with incorrect dependencyVendor'
)
  .get(
    '/symfony/symfony/v5.2.3.json?dependencyVendor=twiiiiiiiiiig&dependencyRepo=twig'
  )
  .expectBadge({
    label: 'dependency version',
    message: 'version requirement not found',
  })

t.create(
  'gets the package version of symfony 5.2.3 - name of the dependencyVendor contains hyphen'
)
  .get('/symfony/symfony/v5.2.3.json?dependencyVendor=ext-xml')
  .expectBadge({ label: 'ext-xml', message: isComposerVersion })

t.create(
  'gets the package version of symfony 5.2.3 - incorrectly with missing dependencyVendor (twig/twig needs both dependencyVendor and dependencyRepo)'
)
  .get('/symfony/symfony/v5.2.3.json?dependencyRepo=twig')
  .expectBadge({
    label: 'dependency version',
    message: 'version requirement not found',
  })

t.create(
  'gets the package version of symfony 5.2.3 - correctly with missing dependencyVendor (php needs only dependencyVendor or dependencyRepo)'
)
  .get('/symfony/symfony/v5.2.3.json?dependencyRepo=php')
  .expectBadge({ label: 'php', message: isComposerVersion })

t.create(
  'gets the package version of symfony 5.2.3 - correctly when the dependencyVendor is the same as the name of the package'
)
  .get(
    '/symfony/symfony/v5.2.3.json?dependencyVendor=symfony&dependencyRepo=contracts'
  )
  .expectBadge({ label: 'symfony/contracts', message: isComposerVersion })

t.create(
  'gets the package version of symfony 5.2.3 - correctly with missing dependencyRepo (php needs only dependencyVendor or dependencyRepo)'
)
  .get('/symfony/symfony/v5.2.3.json?dependencyVendor=php')
  .expectBadge({ label: 'php', message: isComposerVersion })

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
