'use strict'

const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('version')
  .get('/chef-sugar.json')
  .expectBadge({
    label: 'cookbook',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('version (mocked)')
  .get('/chef-sugar.json')
  .intercept(nock =>
    nock('https://supermarket.getchef.com')
      .get('/api/v1/cookbooks/chef-sugar/versions/latest')
      .reply(200, {
        version: '4.1.0',
      })
  )
  .expectBadge({
    label: 'cookbook',
    message: 'v4.1.0',
    color: 'blue',
  })

t.create('version (not found)')
  .get('/not-a-cookbook.json')
  .expectBadge({ label: 'cookbook', message: 'not found' })
