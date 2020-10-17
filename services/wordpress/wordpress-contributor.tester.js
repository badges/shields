'use strict'

const { ServiceTester } = require('../tester')

const t = new ServiceTester({
  id: 'wordpress',
  title: 'WordPress Contributor',
})
module.exports = t

t.create('Plugin Contributor')
  .get('/plugin/contributor/akismet/matt.json')
  .expectBadge({
    label: 'contributor',
    message: 'Matt Mullenweg',
    link: ['https://profiles.wordpress.org/matt'],
  })

t.create('Plugin Contributor (Not Found)')
  .get('/plugin/contributor/akismet/notacontributor.json')
  .expectBadge({
    label: 'contributor',
    message: 'Contributor not found in plugin',
  })
