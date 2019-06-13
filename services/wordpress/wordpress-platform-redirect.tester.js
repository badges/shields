'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('Plugin Tested WP Version (Alias)')
  .get('/akismet.svg', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader('Location', '/wordpress/plugin/tested/akismet.svg')
