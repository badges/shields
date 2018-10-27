'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')

const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')
const { colorScheme } = require('../test-helpers')

const t = new ServiceTester({
  id: 'wordpress',
  title: 'Wordpress Platform Tests',
})
module.exports = t

t.create('Plugin Required WP Version')
  .get('/plugin/wp-version/akismet.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'wordpress',
      value: isVPlusDottedVersionAtLeastOne,
    })
  )

t.create('Plugin Tested WP Version')
  .get('/plugin/tested/akismet.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'wordpress',
      value: Joi.string().regex(/^v\d+(\.\d+)?(\.\d+)? tested$/),
    })
  )

t.create('Plugin Tested WP Version (Alias)')
  .get('/v/akismet.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'wordpress',
      value: Joi.string().regex(/^v\d+(\.\d+)?(\.\d+)? tested$/),
    })
  )

const mockedQuerySelector = {
  action: 'plugin_information',
  request: {
    slug: 'akismet',
    fields: {
      active_installs: '1',
      sections: '0',
      homepage: '0',
      tags: '0',
      screenshot_url: '0',
    },
  },
}

const mockedCoreResponseData = {
  offers: [{ version: '4.9.8' }, { version: '4.9.6' }],
}

t.create('Plugin Tested WP Version - current (mocked)')
  .get('/plugin/tested/akismet.json?style=_shields_test')
  .intercept(nock =>
    nock('https://api.wordpress.org')
      .get('/plugins/info/1.1/')
      .query(mockedQuerySelector)
      .reply(200, {
        version: '1.3',
        rating: 80,
        num_ratings: 100,
        downloaded: 100,
        active_installs: 100,
        requires: '4.9',
        tested: '4.9.8',
      })
      .get('/core/version-check/1.7/')
      .reply(200, mockedCoreResponseData)
  )
  .expectJSON({
    name: 'wordpress',
    value: 'v4.9.8 tested',
    colorB: colorScheme.brightgreen,
  })

t.create('Plugin Tested WP Version - old (mocked)')
  .get('/plugin/tested/akismet.json?style=_shields_test')
  .intercept(nock =>
    nock('https://api.wordpress.org')
      .get('/plugins/info/1.1/')
      .query(mockedQuerySelector)
      .reply(200, {
        version: '1.2',
        rating: 80,
        num_ratings: 100,
        downloaded: 100,
        active_installs: 100,
        requires: '4.9',
        tested: '4.9.6',
      })
      .get('/core/version-check/1.7/')
      .reply(200, mockedCoreResponseData)
  )
  .expectJSON({
    name: 'wordpress',
    value: 'v4.9.6 tested',
    colorB: colorScheme.orange,
  })

t.create('Plugin Tested WP Version - non-exsistant or unsupported (mocked)')
  .get('/plugin/tested/akismet.json?style=_shields_test')
  .intercept(nock =>
    nock('https://api.wordpress.org')
      .get('/plugins/info/1.1/')
      .query(mockedQuerySelector)
      .reply(200, {
        version: '1.2',
        rating: 80,
        num_ratings: 100,
        downloaded: 100,
        active_installs: 100,
        requires: '4.0',
        tested: '4.0.0',
      })
      .get('/core/version-check/1.7/')
      .reply(200, mockedCoreResponseData)
  )
  .expectJSON({
    name: 'wordpress',
    value: 'v4.0.0 tested',
    colorB: colorScheme.yellow,
  })

t.create('Plugin Required WP Version | Not Found')
  .get('/plugin/wp-version/100.json')
  .expectJSON({
    name: 'wordpress',
    value: 'not found',
  })

t.create('Plugin Tested WP Version | Not Found')
  .get('/plugin/tested/100.json')
  .expectJSON({
    name: 'wordpress',
    value: 'not found',
  })

t.create('Plugin Tested WP Version (Alias) | Not Found')
  .get('/v/100.json')
  .expectJSON({
    name: 'wordpress',
    value: 'not found',
  })
