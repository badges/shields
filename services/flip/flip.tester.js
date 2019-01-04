'use strict'

const t = (module.exports = require('../create-service-tester')())

t.create('First request')
  .get('.json')
  .expectJSON({ name: 'flip', value: 'on' })

t.create('Second request')
  .get('.json')
  .expectJSON({ name: 'flip', value: 'off' })
