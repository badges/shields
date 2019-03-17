'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('clojars (valid)')
  .get('/prismic.json')
  .expectBadge({
    label: 'clojars',
    message: /^\[prismic "([0-9][.]?)+"\]$/, // note: https://github.com/badges/shields/pull/431
  })

t.create('clojars (not found)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'clojars', message: 'not found' })
