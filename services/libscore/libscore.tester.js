'use strict'

const { ServiceTester } = require('../tester')

const t = new ServiceTester({ id: 'libscore', title: 'libscore' })
module.exports = t

t.create('no longer available (previously usage statistics)')
  .get('/s/jQuery.json')
  .expectJSON({
    name: 'libscore',
    value: 'no longer available',
  })
