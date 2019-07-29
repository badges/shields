'use strict'

const Joi = require('@hapi/joi')
const { expect } = require('chai')
const t = (module.exports = require('../tester').createServiceTester())

t.create('No URL specified')
  .get('.json?query=$.name&label=Package Name')
  .expectBadge({
    label: 'Package Name',
    message: 'invalid query parameter: url',
    color: 'red',
  })

t.create('No query specified')
  .get(
    '.json?url=https://github.com/badges/shields/raw/master/package.json&label=Package Name'
  )
  .expectBadge({
    label: 'Package Name',
    message: 'invalid query parameter: query',
    color: 'red',
  })

t.create('Malformed url')
  .get(
    '.json?url=https://github.com/badges/shields/raw/master/%0package.json&query=$.name&label=Package Name'
  )
  .expectBadge({
    label: 'Package Name',
    message: 'invalid',
    color: 'lightgrey',
  })

t.create('JSON from url')
  .get(
    '.json?url=https://github.com/badges/shields/raw/master/package.json&query=$.name'
  )
  .expectBadge({
    label: 'custom badge',
    message: 'shields.io',
    color: 'blue',
  })

t.create('JSON from uri (support uri query parameter)')
  .get(
    '.json?uri=https://github.com/badges/shields/raw/master/package.json&query=$.name'
  )
  .expectBadge({
    label: 'custom badge',
    message: 'shields.io',
    color: 'blue',
  })

t.create('JSON from url | multiple results')
  .get(
    '.json?url=https://github.com/badges/shields/raw/master/package.json&query=$..keywords[0:2:1]'
  )
  .expectBadge({ label: 'custom badge', message: 'GitHub, badge' })

t.create('JSON from url | caching with new query params')
  .get(
    '.json?url=https://github.com/badges/shields/raw/master/package.json&query=$.version'
  )
  .expectBadge({
    label: 'custom badge',
    message: Joi.string().regex(/^\d+(\.\d+)?(\.\d+)?$/),
  })

t.create('JSON from url | with prefix & suffix & label')
  .get(
    '.json?url=https://github.com/badges/shields/raw/master/package.json&query=$.version&prefix=v&suffix= dev&label=Shields'
  )
  .expectBadge({
    label: 'Shields',
    message: Joi.string().regex(/^v\d+(\.\d+)?(\.\d+)?\sdev$/),
  })

t.create('JSON from url | object doesnt exist')
  .get(
    '.json?url=https://github.com/badges/shields/raw/master/package.json&query=$.does_not_exist'
  )
  .expectBadge({
    label: 'custom badge',
    message: 'no result',
    color: 'lightgrey',
  })

t.create('JSON from url | invalid url')
  .get(
    '.json?url=https://github.com/badges/shields/raw/master/notafile.json&query=$.version'
  )
  .expectBadge({
    label: 'custom badge',
    message: 'resource not found',
    color: 'red',
  })

t.create('JSON from url | user color overrides default')
  .get(
    '.json?url=https://github.com/badges/shields/raw/master/package.json&query=$.name&color=10ADED'
  )
  .expectBadge({
    label: 'custom badge',
    message: 'shields.io',
    color: '#10aded',
  })

t.create('JSON from url | error color overrides default')
  .get(
    '.json?url=https://github.com/badges/shields/raw/master/notafile.json&query=$.version'
  )
  .expectBadge({
    label: 'custom badge',
    message: 'resource not found',
    color: 'red',
  })

t.create('JSON from url | error color overrides user specified')
  .get('.json?query=$.version&color=10ADED')
  .expectBadge({
    label: 'custom badge',
    message: 'invalid query parameter: url',
    color: 'red',
  })

let headers
t.create('JSON from url | request should set Accept header')
  .get('.json?url=https://json-test/api.json&query=$.name')
  .intercept(nock =>
    nock('https://json-test')
      .get('/api.json')
      .reply(200, function(uri, requestBody) {
        headers = this.req.headers
        return '{"name":"test"}'
      })
  )
  .expectBadge({ label: 'custom badge', message: 'test' })
  .after(() => {
    expect(headers).to.have.property('accept', 'application/json')
  })

t.create('JSON from url | query with lexical error')
  .get(
    '.json?url=https://github.com/badges/shields/raw/master/package.json&query=$[?'
  )
  .expectBadge({
    label: 'custom badge',
    message: 'unparseable jsonpath query',
    color: 'red',
  })

t.create('JSON from url | query with parse error')
  .get(
    '.json?url=https://github.com/badges/shields/raw/master/package.json&query=$.foo,'
  )
  .expectBadge({
    label: 'custom badge',
    message: 'unparseable jsonpath query',
    color: 'red',
  })
