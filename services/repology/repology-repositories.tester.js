'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { nonNegativeInteger } = require('../validators')

t.create('Existing project')
  .get('/starship.json')
  .expectBadge({
    label: 'in repositories',
    message: nonNegativeInteger,
  })

t.create('Non-existent project')
  .get('/invalidprojectthatshouldnotexist.json')
  .expectBadge({
    label: 'in repositories',
    message: '0',
  })
