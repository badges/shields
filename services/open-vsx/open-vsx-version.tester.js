'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { withRegex } = require('../test-validators')

const isVersion = withRegex(/^v(\d+\.\d+\.\d+)(\.\d+)?$/)

t.create('version invalid extension')
  .get('/v/badges/shields.json')
  .expectBadge({
    label: 'open vsx',
    message: 'extension not found',
  })

t.create('version').get('/v/redhat/java.json').expectBadge({
  label: 'open vsx',
  message: isVersion,
})
