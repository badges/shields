import Joi from 'joi'
import { isVPlusDottedVersionNClausesWithOptionalSuffix } from '../test-validators.js'
import { ServiceTester } from '../tester.js'
export const t = new ServiceTester({
  id: 'packagist',
  title: 'Packagist Version',
  pathPrefix: '/packagist',
})

/*
  validator for a packagist version number

  From https://packagist.org/about :
  "version names should match 'X.Y.Z', or 'vX.Y.Z',
  with an optional suffix for RC, beta, alpha or patch versions"
*/
const isPackagistVersion = Joi.string().regex(/^v?[0-9]+.[0-9]+.[0-9]+[\S]*$/)

t.create('version (valid)').get('/v/symfony/symfony.json').expectBadge({
  label: 'packagist',
  message: isPackagistVersion,
})

t.create('version (no releases)').get('/v/wsg/hello.json').expectBadge({
  label: 'packagist',
  message: 'no released version found',
  color: 'red',
})

t.create('version (invalid package name)')
  .get('/v/frodo/is-not-a-package.json')
  .expectBadge({ label: 'packagist', message: 'not found' })

t.create('pre-release version (valid)')
  .get('/v/guzzlehttp/guzzle.json?include_prereleases')
  .expectBadge({
    label: 'packagist',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
  })

t.create('version (valid custom server)')
  .get('/v/symfony/symfony.json?server=https%3A%2F%2Fpackagist.org')
  .expectBadge({
    label: 'packagist',
    message: isPackagistVersion,
  })

t.create('version (invalid custom server)')
  .get('/v/symfony/symfony.json?server=https%3A%2F%2Fpackagist.com')
  .expectBadge({ label: 'packagist', message: 'not found' })

t.create('version (legacy redirect: vpre)')
  .get('/vpre/symfony/symfony.svg')
  .expectRedirect('/packagist/v/symfony/symfony.svg?include_prereleases')

t.create('version (legacy redirect: vpre) (custom server)')
  .get('/vpre/symfony/symfony.svg?server=https%3A%2F%2Fpackagist.org')
  .expectRedirect(
    '/packagist/v/symfony/symfony.svg?include_prereleases&server=https%3A%2F%2Fpackagist.org'
  )
