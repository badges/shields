'use strict'

const { isFileSize } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('repository size').get('/badges/shields.json').expectBadge({
  label: 'repo size',
  message: isFileSize,
})

t.create('repository size (repo not found)')
  .get('/badges/helmets.json')
  .expectBadge({
    label: 'repo size',
    message: 'repo not found',
  })
