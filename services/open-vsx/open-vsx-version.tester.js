'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { withRegex } = require('../test-validators')

const isVersion = withRegex(/^v(\d+\.\d+\.\d+)(\.\d+)?$/)
const isNotFound = withRegex(/^extension not found$/)
const baseUrl = 'https://open-vsx.org/api'

t.create('version invalid extension')
  .get('/v/badges/shields.json')
  .expectBadge({
    label: 'open vsx',
    message: isNotFound,
  })

t.create('version').get('/v/redhat/java.json').expectBadge({
  label: 'open vsx',
  message: isVersion,
})
