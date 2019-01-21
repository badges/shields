'use strict'

const Joi = require('joi')
const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')

const t = (module.exports = require('../create-service-tester')())

t.create('version')
  .get('/chef-sugar.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'cookbook',
      value: isVPlusDottedVersionAtLeastOne,
    })
  )

t.create('version (mocked)')
  .get('/chef-sugar.json?style=_shields_test')
  .intercept(nock =>
    nock('https://supermarket.getchef.com')
      .get('/api/v1/cookbooks/chef-sugar/versions/latest')
      .reply(200, {
        version: '4.1.0',
      })
  )
  .expectJSON({
    name: 'cookbook',
    value: 'v4.1.0',
    color: 'blue',
  })
