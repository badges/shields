'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('Plugin Tested WP Version (Alias)')
  .get('/akismet.svg', {
    followRedirect: false,
  })
  .expectRedirect('/wordpress/plugin/tested/akismet.svg')
