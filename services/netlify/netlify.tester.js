'use strict'

const { isColorMatcher } = require('../color-matcher')
const t = (module.exports = require('../tester').createServiceTester())

t.create('netlify (valid)')
  .get('/0028c6a7-b7ae-49f6-b847-917b40b5b13f')
  .expectBadge({
    label: 'netlify',
    message: isColorMatcher,
  })

t.create('netlify (app not found)')
  .get('/not-an-app')
  .expectBadge({ label: 'netlify', message: 'app not found' })
