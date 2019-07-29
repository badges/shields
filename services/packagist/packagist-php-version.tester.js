'use strict'

const { isComposerVersion } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

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
