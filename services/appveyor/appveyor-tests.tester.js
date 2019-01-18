'use strict'

const Joi = require('joi')

const isAppveyorTestTotals = Joi.string().regex(
  /^[0-9]+ passed(, [0-9]+ failed)?(, [0-9]+ skipped)?$/
)

const isCompactAppveyorTestTotals = Joi.string().regex(
  /^✔ [0-9]+( \| ✘ [0-9]+)?( \| ➟ [0-9]+)?$/
)

const isCustomAppveyorTestTotals = Joi.string().regex(
  /^[0-9]+ good(, [0-9]+ bad)?(, [0-9]+ n\/a)?$/
)

const isCompactCustomAppveyorTestTotals = Joi.string().regex(
  /^💃 [0-9]+( \| 🤦‍♀️ [0-9]+)?( \| 🤷 [0-9]+)?$/
)

const t = (module.exports = require('..').createServiceTester())

t.create('Test status')
  .get('/NZSmartie/coap-net-iu0to.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'tests', value: isAppveyorTestTotals })
  )

t.create('Test status on branch')
  .get('/NZSmartie/coap-net-iu0to/master.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'tests', value: isAppveyorTestTotals })
  )

t.create('Test status with compact message')
  .get('/NZSmartie/coap-net-iu0to.json?compact_message')
  .expectJSONTypes(
    Joi.object().keys({ name: 'tests', value: isCompactAppveyorTestTotals })
  )

t.create('Test status with custom labels')
  .get('/NZSmartie/coap-net-iu0to.json', {
    qs: {
      passed_label: 'good',
      failed_label: 'bad',
      skipped_label: 'n/a',
    },
  })
  .expectJSONTypes(
    Joi.object().keys({ name: 'tests', value: isCustomAppveyorTestTotals })
  )

t.create('Test status with compact message and custom labels')
  .get('/NZSmartie/coap-net-iu0to.json', {
    qs: {
      compact_message: null,
      passed_label: '💃',
      failed_label: '🤦‍♀️',
      skipped_label: '🤷',
    },
  })
  .expectJSONTypes(
    Joi.object().keys({
      name: 'tests',
      value: isCompactCustomAppveyorTestTotals,
    })
  )

t.create('Test status on non-existent project')
  .get('/somerandomproject/thatdoesntexist.json')
  .expectJSON({ name: 'tests', value: 'project not found or access denied' })

t.create('Test status on project that does exist but has no builds yet')
  .get('/gruntjs/grunt.json?style=_shields_test')
  .intercept(nock =>
    nock('https://ci.appveyor.com/api/projects/')
      .get('/gruntjs/grunt')
      .reply(200, {})
  )
  .expectJSON({ name: 'tests', value: 'no builds found', color: 'lightgrey' })
