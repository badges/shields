'use strict'

const { isMetric } = require('../test-validators')
const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'twitter',
  title: 'Twitter',
}))

t.create('Followers')
  .get('/follow/shields_io.json')
  .expectBadge({
    label: 'follow @shields_io',
    message: isMetric,
  })

t.create('Followers - Custom Label')
  .get('/follow/shields_io.json?label=Follow')
  .expectBadge({
    label: 'Follow',
    message: isMetric,
  })

t.create('Invalid Username Specified')
  .get('/follow/invalidusernamethatshouldnotexist.json?label=Follow')
  .expectBadge({
    label: 'Follow',
    message: 'invalid user',
  })

t.create('No connection')
  .get('/follow/shields_io.json?label=Follow')
  .networkOff()
  .expectBadge({ label: 'Follow', message: 'inaccessible' })

t.create('URL')
  .get('/url/https/shields.io.json')
  .expectBadge({ label: 'tweet', message: '' })
