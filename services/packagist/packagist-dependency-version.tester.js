import { isComposerVersion } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('gets the package version')
  .get('/symfony/symfony/twig/twig.json')
  .expectBadge({ label: 'twig/twig', message: isComposerVersion })

t.create('incorrect dependency name')
  .get('/symfony/symfony/twig/twiiiiiiig.json')
  .expectBadge({
    label: 'dependency version',
    message: 'version requirement not found',
  })

t.create('missing vendor of dependency')
  .get('/symfony/symfony/twig.json')
  .expectBadge({
    label: 'dependency version',
    message: 'version requirement not found',
  })

t.create('gets the package version + specified symfony version')
  .get('/symfony/symfony/twig/twig.json?version=v3.2.8')
  .expectBadge({ label: 'twig/twig', message: isComposerVersion })

t.create('gets the package version + valid custom server')
  .get('/symfony/symfony/twig/twig.json?server=https://packagist.org')
  .expectBadge({ label: 'twig/twig', message: isComposerVersion })

t.create('invalid custom server')
  .get('/symfony/symfony/twig/twig.json?server=https://packagisttttttt.org')
  .expectBadge({
    label: 'dependency version',
    message: 'inaccessible',
  })

t.create('incorrect symfony version')
  .get('/symfony/symfony/twig/twig.json?version=v3.2.80000')
  .expectBadge({
    label: 'dependency version',
    message: 'invalid version',
  })

t.create('gets the package version - dependency does not need the vendor')
  .get('/symfony/symfony/ext-xml.json')
  .expectBadge({ label: 'ext-xml', message: isComposerVersion })

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
