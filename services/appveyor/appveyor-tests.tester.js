import {
  isDefaultTestTotals,
  isDefaultCompactTestTotals,
  isCustomTestTotals,
  isCustomCompactTestTotals,
} from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Test status')
  .timeout(10000)
  .get('/NZSmartie/coap-net-iu0to.json')
  .expectBadge({ label: 'tests', message: isDefaultTestTotals })

t.create('Test status on branch')
  .timeout(10000)
  .get('/NZSmartie/coap-net-iu0to/master.json')
  .expectBadge({ label: 'tests', message: isDefaultTestTotals })

t.create('Test status with compact message')
  .timeout(10000)
  .get('/NZSmartie/coap-net-iu0to.json?compact_message')
  .expectBadge({ label: 'tests', message: isDefaultCompactTestTotals })

t.create('Test status with custom labels')
  .timeout(10000)
  .get('/NZSmartie/coap-net-iu0to.json', {
    qs: {
      passed_label: 'good',
      failed_label: 'bad',
      skipped_label: 'n/a',
    },
  })
  .expectBadge({ label: 'tests', message: isCustomTestTotals })

t.create('Test status with compact message and custom labels')
  .timeout(10000)
  .get('/NZSmartie/coap-net-iu0to.json', {
    qs: {
      compact_message: null,
      passed_label: '💃',
      failed_label: '🤦‍♀️',
      skipped_label: '🤷',
    },
  })
  .expectBadge({
    label: 'tests',
    message: isCustomCompactTestTotals,
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
