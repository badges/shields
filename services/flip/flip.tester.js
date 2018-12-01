'use strict'

const t = require('../create-service-tester')()
module.exports = t

t.create('First request')
  .get('.json')
  .expectJSON({ name: 'flip', value: 'on' })

t.create('Second request')
  .get('.json')
  .expectJSON({ name: 'flip', value: 'off' })
