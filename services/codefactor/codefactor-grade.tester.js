'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { isValidGrade } = require('./codefactor-helpers')

t.create('Grade').get('/github/google/guava.json').expectBadge({
  label: 'code quality',
  message: isValidGrade,
})

t.create('Grade (branch)')
  .get('/github/pallets/flask/master.json')
  .expectBadge({
    label: 'code quality',
    message: isValidGrade,
  })

t.create('Grade (nonexistent repo)')
  .get('/github/badges/asdfasdfasdfasdfasfae.json')
  .expectBadge({
    label: 'code quality',
    message: 'repo or branch not found',
  })
