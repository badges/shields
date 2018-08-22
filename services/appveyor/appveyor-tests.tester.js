'use strict'

const Joi = require('joi')
const createServiceTester = require('../create-service-tester')

const isAppveyorTestTotals = Joi.string().regex(
  /^(?:[0-9]+ (?:passed|skipped|failed)(?:, )?)+$/
)

const t = createServiceTester()
module.exports = t

// Test AppVeyor tests status badge
t.create('tests status')
  .get('/NZSmartie/coap-net-iu0to.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'tests', value: isAppveyorTestTotals })
  )

// Test AppVeyor branch tests status badge
t.create('tests status on master branch')
  .get('/NZSmartie/coap-net-iu0to/master.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'tests', value: isAppveyorTestTotals })
  )

// Test AppVeyor tests status badge for a non-existing project
t.create('tests 404')
  .get('/somerandomproject/thatdoesntexits.json')
  .expectJSON({ name: 'tests', value: 'project not found or access denied' })
