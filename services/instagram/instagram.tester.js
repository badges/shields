'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Followers')
  .get('/instagram.json')
  .expectBadge({
    label: 'follow @instagram',
    message: isMetric,
    link: ['https://www.instagram.com/instagram'],
  })

t.create('User not found')
  .get('/this-user-does-not-exist.json')
  .expectBadge({
    message: 'user not found',
  })
