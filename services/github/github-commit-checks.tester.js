'use strict'

const { invalidJSONString } = require('../response-fixtures')
const t = (module.exports = require('../tester').createServiceTester())

t.create('commit checks - passing')
  .get('/badges/shields/5b31a2c692cf999bd499420086b537479efc93e7.json')
  .expectBadge({
    label: 'checks',
    message: 'passing',
    color: 'brightgreen',
  })

t.create('commit checks - failing')
  .get('/badges/shields/91b108d4b7359b2f8794a4614c11cb1157dc9fff.json')
  .expectBadge({
    label: 'checks',
    message: 'failing',
    color: 'red',
  })

t.create('commit checks - nonexistent ref')
  .get('/badges/shields/this-ref-does-not-exist.json')
  .expectBadge({
    label: 'checks',
    message: 'ref not found',
    color: 'red',
  })
