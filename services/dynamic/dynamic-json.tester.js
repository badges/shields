import Joi from 'joi'
import { expect } from 'chai'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

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
    message: 'inaccessible',
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

t.create('support uri query parameter')
  .get(
    '.json?uri=https://github.com/badges/shields/raw/master/package.json&query=$.name'
  )
  .expectBadge({
    label: 'custom badge',
    message: 'shields.io',
    color: 'blue',
  })

t.create('multiple results')
  .get(
    '.json?url=https://github.com/badges/shields/raw/master/package.json&query=$..keywords[0:2:1]'
  )
  .expectBadge({ label: 'custom badge', message: 'GitHub, badge' })

t.create('caching with new query params')
  .get(
    '.json?url=https://github.com/badges/shields/raw/master/package.json&query=$.version'
  )
  .expectBadge({
    label: 'custom badge',
    message: Joi.string().regex(/^\d+(\.\d+)?(\.\d+)?$/),
  })

t.create('prefix & suffix & label')
  .get(
    '.json?url=https://github.com/badges/shields/raw/master/package.json&query=$.version&prefix=v&suffix= dev&label=Shields'
  )
  .expectBadge({
    label: 'Shields',
    message: Joi.string().regex(/^v\d+(\.\d+)?(\.\d+)?\sdev$/),
  })

t.create("key doesn't exist")
  .get(
    '.json?url=https://github.com/badges/shields/raw/master/package.json&query=$.does_not_exist'
  )
  .expectBadge({
    label: 'custom badge',
    message: 'no result',
    color: 'lightgrey',
  })

t.create('invalid url')
  .get(
    '.json?url=https://github.com/badges/shields/raw/master/notafile.json&query=$.version'
  )
  .expectBadge({
    label: 'custom badge',
    message: 'resource not found',
    color: 'red',
  })

t.create('user color overrides default')
  .get(
    '.json?url=https://github.com/badges/shields/raw/master/package.json&query=$.name&color=10ADED'
  )
  .expectBadge({
    label: 'custom badge',
    message: 'shields.io',
    color: '#10aded',
  })

t.create('error color overrides default')
  .get(
    '.json?url=https://github.com/badges/shields/raw/master/notafile.json&query=$.version'
  )
  .expectBadge({
    label: 'custom badge',
    message: 'resource not found',
    color: 'red',
  })

t.create('error color overrides user specified')
  .get('.json?query=$.version&color=10ADED')
  .expectBadge({
    label: 'custom badge',
    message: 'invalid query parameter: url',
    color: 'red',
  })

let headers
t.create('request should set Accept header')
  .get('.json?url=https://json-test/api.json&query=$.name')
  .intercept(nock =>
    nock('https://json-test')
      .get('/api.json')
      .reply(200, function (uri, requestBody) {
        headers = this.req.headers
        return '{"name":"test"}'
      })
  )
  .expectBadge({ label: 'custom badge', message: 'test' })
  .after(() => {
    expect(headers).to.have.property('accept', 'application/json')
  })

t.create('query with lexical error')
  .get(
    '.json?url=https://github.com/badges/shields/raw/master/package.json&query=$[?'
  )
  .expectBadge({
    label: 'custom badge',
    message: 'unparseable jsonpath query',
    color: 'red',
  })

t.create('query with parse error')
  .get(
    '.json?url=https://github.com/badges/shields/raw/master/package.json&query=$.foo,'
  )
  .expectBadge({
    label: 'custom badge',
    message: 'unparseable jsonpath query',
    color: 'red',
  })

// Example from https://stackoverflow.com/q/11670384/893113
const badQuery =
  "$[?(en|**|(@.object.property.one=='other') && (@.object.property.two=='something(abc/def)'))]"
t.create('query with invalid token')
  .get(
    `.json?url=https://github.com/badges/shields/raw/master/package.json&query=${encodeURIComponent(
      badQuery
    )}`
  )
  .expectBadge({
    label: 'custom badge',
    message: 'unparseable jsonpath query',
    color: 'red',
  })

t.create('JSON contains an array')
  .get('.json?url=https://example.test/json&query=$[0]')
  .intercept(nock =>
    nock('https://example.test').get('/json').reply(200, '["foo"]')
  )
  .expectBadge({
    label: 'custom badge',
    message: 'foo',
  })

t.create('JSON contains a string')
  .get('.json?url=https://example.test/json&query=$.foo,')
  .intercept(nock =>
    nock('https://example.test').get('/json').reply(200, '"foo"')
  )
  .expectBadge({
    label: 'custom badge',
    message: 'resource must contain an object or array',
    color: 'lightgrey',
  })
