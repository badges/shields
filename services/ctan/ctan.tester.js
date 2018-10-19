'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { colorScheme } = require('../test-helpers')
const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')

const t = new ServiceTester({
  id: 'ctan',
  title: 'Comprehensive TEX Archive Network',
})
module.exports = t

t.create('license')
  .get('/l/novel.json')
  .expectJSON({
    name: 'license',
    value: 'lppl1.3c, ofl',
  })

t.create('license missing')
  .get('/l/novel.json')
  .intercept(nock =>
    nock('http://www.ctan.org')
      .get('/json/pkg/novel')
      .reply(200, {
        version: {
          number: 'notRelevant',
        },
      })
  )
  .expectJSON({
    name: 'license',
    value: 'missing',
  })

t.create('single license')
  .get('/l/tex.json')
  .intercept(nock =>
    nock('http://www.ctan.org')
      .get('/json/pkg/tex')
      .reply(200, {
        license: 'knuth',
        version: {
          number: 'notRelevant',
        },
      })
  )
  .expectJSON({
    name: 'license',
    value: 'knuth',
  })

t.create('version')
  .get('/v/novel.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'ctan',
      value: isVPlusDottedVersionAtLeastOne,
    })
  )

t.create('version (mocked)')
  .get('/v/novel.json?style=_shields_test')
  .intercept(nock =>
    nock('http://www.ctan.org')
      .get('/json/pkg/novel')
      .reply(200, {
        version: {
          number: 'v1.11',
        },
      })
  )
  .expectJSON({
    name: 'ctan',
    value: 'v1.11',
    colorB: colorScheme.blue,
  })
