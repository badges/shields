'use strict'

const Joi = require('joi')
const { withRegex } = require('../test-validators')

const t = (module.exports = require('../tester').createServiceTester())

t.create('(live) jquery hits/day')
  .get('/dd/jquery.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'jsDelivr',
      value: withRegex(/^(\d)+([kMG])*( hits\/)+(day)$/),
    })
  )

t.create('(live) jquery hits/week')
  .get('/dw/jquery.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'jsDelivr',
      value: withRegex(/^(\d)+([kMG])*( hits\/)+(week)$/),
    })
  )

t.create('(live) jquery hits/month')
  .get('/dm/jquery.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'jsDelivr',
      value: withRegex(/^(\d)+([kMG])*( hits\/)+(month)$/),
    })
  )

t.create('(live) jquery hits/year')
  .get('/dy/jquery.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'jsDelivr',
      value: withRegex(/^(\d)+([kMG])*( hits\/)+(year)$/),
    })
  )

t.create('(live) fake package')
  .get('/dd/somefakepackage.json')
  .expectJSON({
    name: 'jsDelivr',
    // Will return 0 hits/day as the endpoint can't send 404s at present.
    value: '0 hits/day',
  })
