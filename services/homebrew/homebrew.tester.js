'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { isVPlusTripleDottedVersion } = require('../test-validators')
const { invalidJSON } = require('../response-fixtures')

const t = (module.exports = new ServiceTester({
  id: 'homebrew',
  title: 'homebrew',
}))

t.create('homebrew (valid)')
  .get('/v/cake.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'homebrew',
      value: isVPlusTripleDottedVersion,
    })
  )

t.create('homebrew (valid, mocked response)')
  .get('/v/cake.json')
  .intercept(nock =>
    nock('https://formulae.brew.sh')
      .get('/api/formula/cake.json')
      .reply(200, { versions: { stable: '0.23.0', devel: null, head: null } })
  )
  .expectJSON({ name: 'homebrew', value: 'v0.23.0' })

t.create('homebrew (invalid)')
  .get('/v/not-a-package.json')
  .expectJSON({ name: 'homebrew', value: 'not found' })

t.create('homebrew (connection error)')
  .get('/v/cake.json')
  .networkOff()
  .expectJSON({ name: 'homebrew', value: 'inaccessible' })

t.create('homebrew (unexpected response)')
  .get('/v/cake.json')
  .intercept(nock =>
    nock('https://formulae.brew.sh')
      .get('/api/formula/cake.json')
      .reply(invalidJSON)
  )
  .expectJSON({ name: 'homebrew', value: 'invalid' })
