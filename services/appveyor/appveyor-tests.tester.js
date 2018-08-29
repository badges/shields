'use strict'

const Joi = require('joi')
const createServiceTester = require('../create-service-tester')

const isAppveyorTestTotals = Joi.string().regex(
  /^(?:[0-9]+ (?:passed|skipped|failed)(?:, )?)+$/
)

const isCompactAppveyorTestTotals = Joi.string().regex(
  /^(?:[0-9]* ?(?:✔|✘|➟) ?[0-9]*(?:, | \| )?)+$/
)

const t = createServiceTester()
module.exports = t

t.create('test status')
  .get('/NZSmartie/coap-net-iu0to.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'tests', value: isAppveyorTestTotals })
  )

t.create('test status on branch')
  .get('/NZSmartie/coap-net-iu0to/master.json')
  .expectJSONTypes(
    Joi.object().keys({ name: 'tests', value: isAppveyorTestTotals })
  )

t.create('test status with compact message')
  .get('/NZSmartie/coap-net-iu0to.json?compact_message')
  .expectJSONTypes(
    Joi.object().keys({ name: 'tests', value: isCompactAppveyorTestTotals })
  )

t.create('test status on non-existent project')
  .get('/somerandomproject/thatdoesntexist.json')
  .expectJSON({ name: 'tests', value: 'project not found or access denied' })
