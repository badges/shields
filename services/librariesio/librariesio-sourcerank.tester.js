'use strict'

const { anyInteger } = require('../validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('sourcerank')
  .timeout(10000)
  .get('/npm/got.json')
  .expectBadge({
    label: 'sourcerank',
    message: anyInteger,
  })

t.create('sourcerank (scoped npm package)')
  .timeout(10000)
  .get('/npm/@babel/core.json')
  .expectBadge({
    label: 'sourcerank',
    message: anyInteger,
  })

t.create('sourcerank (not a package)')
  .timeout(10000)
  .get('/npm/foobar-is-not-package.json')
  .expectBadge({
    label: 'sourcerank',
    message: 'package not found',
  })
