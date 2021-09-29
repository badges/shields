import Joi from 'joi'
import { isVPlusDottedVersionAtLeastOne } from '../test-validators.js'
import { ServiceTester } from '../tester.js'
export const t = new ServiceTester({
  id: 'BowerVersion',
  title: 'Bower Version',
  pathPrefix: '/bower',
})

const isBowerPrereleaseVersion = Joi.string().regex(
  /^v\d+(\.\d+)?(\.\d+)?(-?[.\w\d])+?$/
)

t.create('version').timeout(10000).get('/v/bootstrap.json').expectBadge({
  label: 'bower',
  message: isVPlusDottedVersionAtLeastOne,
})

t.create('pre version') // e.g. bower|v0.2.5-alpha-rc-pre
  .timeout(10000)
  .get('/v/bootstrap.json?include_prereleases')
  .expectBadge({
    label: 'bower',
    message: isBowerPrereleaseVersion,
  })

t.create('Version for Invalid Package')
  .timeout(10000)
  .get('/v/it-is-a-invalid-package-should-error.json')
  .expectBadge({ label: 'bower', message: 'package not found' })

t.create('Pre Version for Invalid Package')
  .timeout(10000)
  .get('/v/it-is-a-invalid-package-should-error.json?include_prereleases')
  .expectBadge({ label: 'bower', message: 'package not found' })

t.create('Version (legacy redirect: vpre)')
  .get('/vpre/bootstrap.svg')
  .expectRedirect('/bower/v/bootstrap.svg?include_prereleases')
