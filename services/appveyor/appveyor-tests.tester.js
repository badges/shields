import queryString from 'querystring'
import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

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

t.create('Test status')
  .timeout(10000)
  .get('/NZSmartie/coap-net-iu0to.json')
  .expectBadge({ label: 'tests', message: isAppveyorTestTotals })

t.create('Test status on branch')
  .timeout(10000)
  .get('/NZSmartie/coap-net-iu0to/master.json')
  .expectBadge({ label: 'tests', message: isAppveyorTestTotals })

t.create('Test status with compact message')
  .timeout(10000)
  .get('/NZSmartie/coap-net-iu0to.json?compact_message')
  .expectBadge({ label: 'tests', message: isCompactAppveyorTestTotals })

t.create('Test status with custom labels')
  .timeout(10000)
  .get('/NZSmartie/coap-net-iu0to.json', {
    qs: {
      passed_label: 'good',
      failed_label: 'bad',
      skipped_label: 'n/a',
    },
  })
  .expectBadge({ label: 'tests', message: isCustomAppveyorTestTotals })

t.create('Test status with compact message and custom labels')
  .timeout(10000)
  .get(
    `/NZSmartie/coap-net-iu0to.json?${queryString.stringify({
      compact_message: null,
      passed_label: '💃',
      failed_label: '🤦‍♀️',
      skipped_label: '🤷',
    })}`
  )
  .expectBadge({
    label: 'tests',
    message: isCompactCustomAppveyorTestTotals,
  })

t.create('Test status on non-existent project')
  .timeout(10000)
  .get('/somerandomproject/thatdoesntexist.json')
  .expectBadge({
    label: 'tests',
    message: 'project not found or access denied',
  })

t.create('Test status on project that does exist but has no builds yet')
  .get('/gruntjs/grunt.json')
  .intercept(nock =>
    nock('https://ci.appveyor.com/api/projects/')
      .get('/gruntjs/grunt')
      .reply(200, {})
  )
  .expectBadge({
    label: 'tests',
    message: 'no builds found',
    color: 'lightgrey',
  })
