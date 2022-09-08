import { isComposerVersion } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('gets the package version of symfony 5.2.3 - without query params')
  .get('/symfony/symfony/v5.2.3.json')
  .expectBadge({
    label: 'dependency version',
    message: 'version requirement not found',
  })

t.create('gets the package version of symfony - with correct dependency')
  .get('/symfony/symfony/twig/twig.json')
  .expectBadge({ label: 'twig/twig', message: isComposerVersion })

t.create(
  'gets the package version of symfony - with correct dependency and specified version'
)
  .get('/symfony/symfony/twig/twig.json?version=v3.2.8')
  .expectBadge({ label: 'twig/twig', message: isComposerVersion })

t.create(
  'gets the package version of symfony - with correct dependency, correct version and correct custom server'
)
  .get(
    '/symfony/symfony/twig/twig.json?version=v3.2.8&server=https://packagist.org'
  )
  .expectBadge({ label: 'twig/twig', message: isComposerVersion })

t.create(
  'gets the package version of symfony - with correct dependency and specified version and incorrect custom server'
)
  .get(
    '/symfony/symfony/twig/twig.json?version=v3.2.8&server=https://packagisttttttt.org'
  )
  .expectBadge({
    label: 'dependency version',
    message: 'inaccessible',
  })

t.create('gets the package version of symfony - with incorrect dependency name')
  .get('/symfony/symfony/twig/twiiiiiiig.json?version=v3.2.8')
  .expectBadge({
    label: 'dependency version',
    message: 'version requirement not found',
  })

t.create('gets the package version of symfony - with incorrect version')
  .get('/symfony/symfony/twig/twig.json?version=v3.2.80000')
  .expectBadge({
    label: 'dependency version',
    message: 'invalid version',
  })

t.create(
  `gets the package version of symfony 5.2.3 - incorrectly with missing part of dependency's name`
)
  .get('/symfony/symfony/twig.json')
  .expectBadge({
    label: 'dependency version',
    message: 'version requirement not found',
  })

t.create(
  'gets the package version of symfony 5.2.3 - name of the dependency contains hyphen'
)
  .get('/symfony/symfony/ext-xml.json?version=v5.2.3')
  .expectBadge({ label: 'ext-xml', message: isComposerVersion })

t.create(
  'gets the package version of symfony 5.2.3 - correctly when the dependency is the same as the name of the package'
)
  .get('/symfony/symfony/symfony/contracts.json')
  .expectBadge({ label: 'symfony/contracts', message: isComposerVersion })

t.create('package with no requirements')
  .get('/bpampuch/pdfmake/twig/twig.json')
  .expectBadge({
    label: 'dependency version',
    message: 'version requirement not found',
  })

t.create('package with no twig/twig version requirement')
  .get('/raulfraile/ladybug-theme-modern/twig/twig.json')
  .expectBadge({
    label: 'dependency version',
    message: 'version requirement not found',
  })
