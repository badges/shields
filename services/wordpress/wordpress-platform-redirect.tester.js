'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('Plugin Tested WP Version (Alias)')
  .get('/akismet.svg')
  .expectRedirect('/wordpress/plugin/tested/akismet.svg')
