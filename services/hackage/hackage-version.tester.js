'use strict'

const Joi = require('joi')
const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('hackage version (valid)')
  .get('/lens.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'hackage',
      value: isVPlusDottedVersionAtLeastOne,
    })
  )

t.create('hackage version (not found)')
  .get('/not-a-package.json')
  .expectJSON({ name: 'hackage', value: 'not found' })

t.create('hackage version (unexpected response)')
  .get('/lens.json')
  .intercept(nock =>
    nock('https://hackage.haskell.org')
      .get('/package/lens/lens.cabal')
      .reply(200, '')
  )
  .expectJSON({ name: 'hackage', value: 'invalid response data' })
