'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { isFormattedDate } = require('../test-validators')

t.create('release date invalid extension')
  .get('/release-date/badges/shields.json')
  .expectBadge({
    label: 'release date',
    message: 'extension not found',
  })

t.create('release date').get('/release-date/redhat/java.json').expectBadge({
  label: 'release date',
  message: isFormattedDate,
})
