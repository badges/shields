'use strict'

const { anyInteger } = require('../validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('sourcerank')
  .get('/npm/got.json')
  .expectBadge({
    label: 'sourcerank',
    message: anyInteger,
  })

t.create('dependent count (not a package)')
  .get('/npm/foobar-is-not-package.json')
  .expectBadge({
    label: 'sourcerank',
    message: 'package not found',
  })
