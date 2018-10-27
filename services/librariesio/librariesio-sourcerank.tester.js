'use strict'

const Joi = require('joi')
const createServiceTester = require('../create-service-tester')
const { anyInteger } = require('../validators')

const t = createServiceTester()
module.exports = t

t.create('sourcerank')
  .get('/npm/got.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'sourcerank',
      value: anyInteger,
    })
  )

t.create('dependent count (not a package)')
  .get('/npm/foobar-is-not-package.json')
  .expectJSON({
    name: 'sourcerank',
    value: 'package not found',
  })
