'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { isMetric, isSemver } = require('../test-validators')
const colorscheme = require('../../lib/colorscheme.json')
const mapValues = require('lodash.mapvalues')

const t = new ServiceTester({ id: 'npm', title: 'NPM' })
module.exports = t
const colorsB = mapValues(colorscheme, 'colorB')

const isTypeDefinition = Joi.string().regex(
  /^(Flow|TypeScript) v?[0-9]+.[0-9]+( \| (Flow|TypeScript) v?[0-9]+.[0-9]+)?$/
)

t.create('total downloads of left-pad')
  .get('/dt/left-pad.json?style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetric,
      colorB: colorsB.brightgreen,
    })
  )

t.create('total downloads of @cycle/core')
  .get('/dt/@cycle/core.json')
  .expectJSONTypes(Joi.object().keys({ name: 'downloads', value: isMetric }))

t.create('total downloads of package with zero downloads')
  .get('/dt/package-no-downloads.json?style=_shields_test')
  .intercept(nock =>
    nock('https://api.npmjs.org')
      .get('/downloads/range/1000-01-01:3000-01-01/package-no-downloads')
      .reply(200, {
        downloads: [{ downloads: 0, day: '2018-01-01' }],
      })
  )
  .expectJSON({ name: 'downloads', value: '0', colorB: colorsB.red })

t.create('exact total downloads value')
  .get('/dt/exact-value.json')
  .intercept(nock =>
    nock('https://api.npmjs.org')
      .get('/downloads/range/1000-01-01:3000-01-01/exact-value')
      .reply(200, {
        downloads: [
          { downloads: 2, day: '2018-01-01' },
          { downloads: 3, day: '2018-01-02' },
        ],
      })
  )
  .expectJSON({ name: 'downloads', value: '5' })

t.create('total downloads when network is off')
  .get('/dt/@cycle/core.json?style=_shields_test')
  .networkOff()
  .expectJSON({
    name: 'downloads',
    value: 'inaccessible',
    colorB: colorsB.lightgray,
  })

t.create('total downloads of unknown package')
  .get('/dt/npm-api-does-not-have-this-package.json?style=_shields_test')
  .expectJSON({
    name: 'downloads',
    value: 'package not found or too new',
    colorB: colorsB.red,
  })

t.create('gets the package version of left-pad')
  .get('/v/left-pad.json')
  .expectJSONTypes(Joi.object().keys({ name: 'npm', value: isSemver }))

t.create('gets the package version of @cycle/core')
  .get('/v/@cycle/core.json')
  .expectJSONTypes(Joi.object().keys({ name: 'npm', value: isSemver }))

t.create('gets a tagged package version of npm')
  .get('/v/npm/next.json')
  .expectJSONTypes(Joi.object().keys({ name: 'npm@next', value: isSemver }))

t.create('gets the correct tagged package version of npm')
  .intercept(nock =>
    nock('https://registry.npmjs.org')
      .get('/-/package/npm/dist-tags')
      .reply(200, { latest: '1.2.3', next: '4.5.6' })
  )
  .get('/v/npm/next.json')
  .expectJSON({ name: 'npm@next', value: 'v4.5.6' })

t.create('returns an error for version with an invalid tag')
  .get('/v/npm/frodo.json')
  .expectJSON({ name: 'npm', value: 'tag not found' })

t.create('gets the package version of left-pad from a custom registry')
  .get('/v/left-pad.json?registry_uri=https://registry.npmjs.com')
  .expectJSONTypes(Joi.object().keys({ name: 'npm', value: isSemver }))

t.create('gets the tagged package version of @cycle/core')
  .get('/v/@cycle/core/canary.json')
  .expectJSONTypes(Joi.object().keys({ name: 'npm@canary', value: isSemver }))

t.create(
  'gets the tagged package version of @cycle/core from a custom registry'
)
  .get('/v/@cycle/core/canary.json?registry_uri=https://registry.npmjs.com')
  .expectJSONTypes(Joi.object().keys({ name: 'npm@canary', value: isSemver }))

t.create('gets the license of express')
  .get('/l/express.json')
  .expectJSONTypes(Joi.object().keys({ name: 'license', value: 'MIT' }))

t.create('gets the license of express from a custom registry')
  .get('/l/express.json?registry_uri=https://registry.npmjs.com')
  .expectJSONTypes(Joi.object().keys({ name: 'license', value: 'MIT' }))

t.create('invalid package name')
  .get('/v/frodo-is-not-a-package.json')
  .expectJSON({ name: 'npm', value: 'package not found' })

t.create('gets the package version of left-pad from a custom registry')
  .get('/v/left-pad.json?registry_uri=https://registry.npmjs.com')
  .expectJSONTypes(Joi.object().keys({ name: 'npm', value: isSemver }))

t.create('public domain license')
  .get('/l/redux-auth.json?style=_shields_test')
  .expectJSON({ name: 'license', value: 'WTFPL', colorB: '#7cd958' })

t.create('copyleft license')
  .get('/l/trianglify.json?style=_shields_test')
  .expectJSON({ name: 'license', value: 'GPL-3.0', colorB: colorsB.orange })

t.create('permissive license')
  .get('/l/express.json?style=_shields_test')
  .expectJSON({ name: 'license', value: 'MIT', colorB: colorsB.green })

t.create('permissive license for scoped package')
  .get('/l/@cycle%2Fcore.json?style=_shields_test')
  .expectJSON({ name: 'license', value: 'MIT', colorB: colorsB.green })

t.create(
  'permissive and copyleft licenses (SPDX license expression syntax version 2.0)'
)
  .get('/l/rho-cc-promise.json?style=_shields_test')
  .expectJSON({
    name: 'license',
    value: '(MPL-2.0 OR MIT)',
    colorB: colorsB.lightgrey,
  })

t.create('license for package without a license property')
  .get('/l/package-without-license.json?style=_shields_test')
  .intercept(nock =>
    nock('https://registry.npmjs.org')
      .get('/package-without-license/latest')
      .reply(200, {
        name: 'package-without-license',
      })
  )
  .expectJSON({ name: 'license', value: 'missing', colorB: colorsB.red })

t.create('license for package with a license object')
  .get('/l/package-license-object.json?style=_shields_test')
  .intercept(nock =>
    nock('https://registry.npmjs.org')
      .get('/package-license-object/latest')
      .reply(200, {
        name: 'package-license-object',
        license: {
          type: 'MIT',
          url: 'https://www.opensource.org/licenses/mit-license.php',
        },
      })
  )
  .expectJSON({ name: 'license', value: 'MIT', colorB: colorsB.green })

t.create('license for package with a license array')
  .get('/l/package-license-array.json?style=_shields_test')
  .intercept(nock =>
    nock('https://registry.npmjs.org')
      .get('/package-license-array/latest')
      .reply(200, {
        name: 'package-license-object',
        license: ['MPL-2.0', 'MIT'],
      })
  )
  .expectJSON({
    name: 'license',
    value: 'MPL-2.0, MIT',
    colorB: colorsB.lightgrey,
  })

t.create('license for unknown package')
  .get('/l/npm-registry-does-not-have-this-package.json?style=_shields_test')
  .expectJSON({
    name: 'license',
    value: 'package not found',
    colorB: colorsB.red,
  })

t.create('license when network is off')
  .get('/l/pakage-network-off.json?style=_shields_test')
  .networkOff()
  .expectJSON({
    name: 'license',
    value: 'inaccessible',
    colorB: colorsB.lightgrey,
  })

t.create('types')
  .get('/types/chalk.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'type definitions', value: isTypeDefinition })
  )

t.create('no types')
  .get('/types/left-pad.json')
  .expectJSON({ name: 'type definitions', value: 'none' })
