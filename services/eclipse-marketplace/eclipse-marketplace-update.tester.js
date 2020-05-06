'use strict'

const { isFormattedDate } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('last update date').get('/notepad4e.json').expectBadge({
  label: 'updated',
  message: isFormattedDate,
})

t.create('last update for unknown solution')
  .get('/this-does-not-exist.json')
  .expectBadge({
    label: 'updated',
    message: 'solution not found',
  })
