import Joi from 'joi'
import { expect } from 'chai'
import { createServiceTester } from '../tester.js'
import { isRelativeFormattedDate } from '../test-validators.js'
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

t.create('formatter addv')
  .get('.json?url=https://json-test/api.json&query=$.version&formatter=addv')
  .intercept(nock =>
    nock('https://json-test')
      .get('/api.json')
      .reply(200, function (uri, requestBody) {
        return JSON.stringify({ version: '0.0.0' })
      })
  )
  .expectBadge({
    label: 'custom badge',
    message: 'v0.0.0',
    color: 'blue',
  })

t.create('formatter omitv')
  .get('.json?url=https://json-test/api.json&query=$.version&formatter=omitv')
  .intercept(nock =>
    nock('https://json-test')
      .get('/api.json')
      .reply(200, function (uri, requestBody) {
        return JSON.stringify({ version: 'v0.0.0' })
      })
  )
  .expectBadge({
    label: 'custom badge',
    message: '0.0.0',
    color: 'blue',
  })

t.create('formatter metric')
  .get('.json?url=https://json-test/api.json&query=$.count&formatter=metric')
  .intercept(nock =>
    nock('https://json-test')
      .get('/api.json')
      .reply(200, function (uri, requestBody) {
        return JSON.stringify({ count: 123456789 })
      })
  )
  .expectBadge({
    label: 'custom badge',
    message: '123M',
    color: 'blue',
  })

t.create('formatter metric invalid value')
  .get('.json?url=https://json-test/api.json&query=$.count&formatter=metric')
  .intercept(nock =>
    nock('https://json-test')
      .get('/api.json')
      .reply(200, function (uri, requestBody) {
        return JSON.stringify({ count: 'notanumber' })
      })
  )
  .expectBadge({
    label: 'custom badge',
    message: 'notanumber',
    color: 'blue',
  })

t.create('formatter starRating')
  .get(
    '.json?url=https://json-test/api.json&query=$.rating&formatter=starRating'
  )
  .intercept(nock =>
    nock('https://json-test')
      .get('/api.json')
      .reply(200, function (uri, requestBody) {
        return JSON.stringify({ rating: 4.5 })
      })
  )
  .expectBadge({
    label: 'custom badge',
    message: '★★★★½',
    color: 'blue',
  })

t.create('formatter starRating invalid value')
  .get(
    '.json?url=https://json-test/api.json&query=$.rating&formatter=starRating'
  )
  .intercept(nock =>
    nock('https://json-test')
      .get('/api.json')
      .reply(200, function (uri, requestBody) {
        return JSON.stringify({ rating: 'notanumber' })
      })
  )
  .expectBadge({
    label: 'custom badge',
    message: '☆☆☆☆☆',
    color: 'blue',
  })

t.create('formatter ordinalNumber')
  .get(
    '.json?url=https://json-test/api.json&query=$.rank&formatter=ordinalNumber'
  )
  .intercept(nock =>
    nock('https://json-test')
      .get('/api.json')
      .reply(200, function (uri, requestBody) {
        return JSON.stringify({ rank: 9 })
      })
  )
  .expectBadge({
    label: 'custom badge',
    message: '9ᵗʰ',
    color: 'blue',
  })

t.create('formatter ordinalNumber invalid value')
  .get(
    '.json?url=https://json-test/api.json&query=$.rank&formatter=ordinalNumber'
  )
  .intercept(nock =>
    nock('https://json-test')
      .get('/api.json')
      .reply(200, function (uri, requestBody) {
        return JSON.stringify({ rank: 'notanumber' })
      })
  )
  .expectBadge({
    label: 'custom badge',
    message: 'notanumberᵗʰ',
    color: 'blue',
  })

t.create('formatter formatDate')
  .get('.json?url=https://json-test/api.json&query=$.date&formatter=formatDate')
  .intercept(nock =>
    nock('https://json-test')
      .get('/api.json')
      .reply(200, function (uri, requestBody) {
        return JSON.stringify({ date: '2019-01-01' })
      })
  )
  .expectBadge({
    label: 'custom badge',
    message: 'january 2019',
    color: 'blue',
  })

t.create('formatter formatDate invalid value')
  .get('.json?url=https://json-test/api.json&query=$.date&formatter=formatDate')
  .intercept(nock =>
    nock('https://json-test')
      .get('/api.json')
      .reply(200, function (uri, requestBody) {
        return JSON.stringify({ date: 'notadate' })
      })
  )
  .expectBadge({
    label: 'custom badge',
    message: 'invalid date',
    color: 'blue',
  })

t.create('formatter formatRelativeDate')
  .get(
    '.json?url=https://json-test/api.json&query=$.timestamp&formatter=formatRelativeDate'
  )
  .intercept(nock =>
    nock('https://json-test')
      .get('/api.json')
      .reply(200, function (uri, requestBody) {
        return JSON.stringify({ timestamp: 1655158963 })
      })
  )
  .expectBadge({
    label: 'custom badge',
    message: isRelativeFormattedDate,
    color: 'blue',
  })

t.create('formatter formatRelativeDate invalid value')
  .get(
    '.json?url=https://json-test/api.json&query=$.timestamp&formatter=formatRelativeDate'
  )
  .intercept(nock =>
    nock('https://json-test')
      .get('/api.json')
      .reply(200, function (uri, requestBody) {
        return JSON.stringify({ timestamp: 'notanumber' })
      })
  )
  .expectBadge({
    label: 'custom badge',
    message: 'invalid date',
    color: 'blue',
  })
