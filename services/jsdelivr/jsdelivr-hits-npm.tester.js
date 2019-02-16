'use strict'

const Joi = require('joi')
const { withRegex } = require('../test-validators')

const t = (module.exports = require('../tester').createServiceTester())

t.create('(live) jquery hits/day')
  .get('/hd/jquery.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'jsdelivr',
      value: withRegex(/^(\d)+([kMG])*( hits\/)+(day)$/),
    })
  )

t.create('(live) jquery hits/week')
  .get('/hw/jquery.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'jsdelivr',
      value: withRegex(/^(\d)+([kMG])*( hits\/)+(week)$/),
    })
  )

t.create('(live) jquery hits/month')
  .get('/hm/jquery.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'jsdelivr',
      value: withRegex(/^(\d)+([kMG])*( hits\/)+(month)$/),
    })
  )

t.create('(live) jquery hits/year')
  .get('/hy/jquery.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'jsdelivr',
      value: withRegex(/^(\d)+([kMG])*( hits\/)+(year)$/),
    })
  )

t.create('(live) fake package')
  .get('/hd/somefakepackage.json')
  .expectJSON({
    name: 'jsdelivr',
    // Will return 0 hits/day as the endpoint can't send 404s at present.
    value: '0 hits/day',
  })
