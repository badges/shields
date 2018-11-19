'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')

const { invalidJSON } = require('../response-fixtures')
const { colorScheme } = require('../test-helpers')

const {
  isVPlusDottedVersionNClausesWithOptionalSuffix,
  isMetric,
  isMetricOverTimePeriod,
} = require('../test-validators')
const isVersionColor = Joi.equal(
  colorScheme.red,
  colorScheme.yellow,
  colorScheme.yellowgreen,
  colorScheme.green,
  colorScheme.brightgreen
)

const t = new ServiceTester({ id: 'dub', title: 'Dub' })
module.exports = t

// downloads

t.create('total downloads (valid)')
  .get('/dt/vibe-d.json?style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetric,
      colorB: isVersionColor,
    })
  )

t.create('total downloads, specific version (valid)')
  .get('/dt/vibe-d/0.8.4.json?style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: Joi.string().regex(/^[1-9][0-9]*[kMGTPEZY]? v0.8.4$/),
      colorB: isVersionColor,
    })
  )
  .timeout(15000)

t.create('total downloads, latest version (valid)')
  .get('/dt/vibe-d/latest.json?style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: Joi.string().regex(/^[1-9][0-9]*[kMGTPEZY]? latest$/),
      colorB: isVersionColor,
    })
  )

t.create('daily downloads (valid)')
  .get('/dd/vibe-d.json?style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetricOverTimePeriod,
      colorB: isVersionColor,
    })
  )

t.create('weekly downloads (valid)')
  .get('/dw/vibe-d.json?style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetricOverTimePeriod,
      colorB: isVersionColor,
    })
  )

t.create('monthly downloads (valid)')
  .get('/dm/vibe-d.json?style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetricOverTimePeriod,
      colorB: isVersionColor,
    })
  )

t.create('total downloads (not found)')
  .get('/dt/not-a-package.json')
  .expectJSON({ name: 'dub', value: 'not found' })

t.create('total downloads (connection error)')
  .get('/dt/vibe-d.json')
  .networkOff()
  .expectJSON({ name: 'dub', value: 'inaccessible' })

t.create('total downloads (unexpected response)')
  .get('/dt/vibe-d.json')
  .intercept(nock =>
    nock('https://code.dlang.org')
      .get('/api/packages/vibe-d/stats')
      .reply(invalidJSON)
  )
  .expectJSON({ name: 'dub', value: 'invalid' })

// version

t.create('version (valid)')
  .get('/v/vibe-d.json?style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'dub',
      value: isVPlusDottedVersionNClausesWithOptionalSuffix,
      colorB: Joi.equal(colorScheme.blue, colorScheme.orange),
    })
  )

t.create('version (not found)')
  .get('/v/not-a-package.json')
  .expectJSON({ name: 'dub', value: 'not found' })

t.create('version (connection error)')
  .get('/v/vibe-d.json')
  .networkOff()
  .expectJSON({ name: 'dub', value: 'inaccessible' })

t.create('version (unexpected response)')
  .get('/v/vibe-d.json')
  .intercept(nock =>
    nock('https://code.dlang.org')
      .get('/api/packages/vibe-d/latest')
      .reply(invalidJSON)
  )
  .expectJSON({ name: 'dub', value: 'invalid' })

// license

t.create('license (valid)')
  .get('/l/vibe-d.json?style=_shields_test')
  .expectJSON({
    name: 'license',
    value: 'MIT',
    colorB: colorScheme.blue,
  })

t.create('license (not found)')
  .get('/l/not-a-package.json')
  .expectJSON({ name: 'dub', value: 'not found' })

t.create('license (connection error)')
  .get('/l/vibe-d.json')
  .networkOff()
  .expectJSON({ name: 'dub', value: 'inaccessible' })

t.create('license (unexpected response)')
  .get('/l/vibe-d.json')
  .intercept(nock =>
    nock('https://code.dlang.org')
      .get('/api/packages/vibe-d/latest/info')
      .reply(invalidJSON)
  )
  .expectJSON({ name: 'dub', value: 'invalid' })
