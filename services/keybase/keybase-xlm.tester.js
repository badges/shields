'use strict'

const { withRegex } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('existing stellar address')
  .get('/skyplabs.json')
  .expectBadge({
    label: 'xlm',
    message: withRegex(/^(?!not found$)/),
  })

t.create('unknown username').get('/skyplabsssssss.json').expectBadge({
  label: 'xlm',
  message: 'profile not found',
})

t.create('invalid username').get('/s.json').expectBadge({
  label: 'xlm',
  message: 'invalid username',
})

t.create('missing stellar address').get('/test.json').expectBadge({
  label: 'xlm',
  message: 'no stellar address found',
})
