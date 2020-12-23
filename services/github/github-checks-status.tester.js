'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('branch checks - passing')
  .get('/badges/shields/master.json')
  .expectBadge({
    label: 'checks',
    message: 'passing',
    color: 'brightgreen',
  })

t.create('branch checks - failing')
  .get('/badges/shields/now-fix.json')
  .expectBadge({
    label: 'checks',
    message: 'failing',
    color: 'red',
  })

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

t.create('tag checks - passing')
  .get('/badges/shields/3.3.0.json')
  .expectBadge({
    label: 'checks',
    message: 'passing',
    color: 'brightgreen',
  })

t.create('checks - nonexistent ref')
  .get('/badges/shields/this-ref-does-not-exist.json')
  .expectBadge({
    label: 'checks',
    message: 'invalid ref',
    color: 'red',
  })