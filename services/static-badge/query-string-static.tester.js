'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('Shields colorscheme color')
  .get(
    '/static/v1.svg?label=label&message=message&color=blue&style=_shields_test'
  )
  .expectJSON({ name: 'label', value: 'message', color: 'blue' })

t.create('CSS named color')
  .get(
    '/static/v1.svg?label=label&message=message&color=whitesmoke&style=_shields_test'
  )
  .expectJSON({ name: 'label', value: 'message', color: 'whitesmoke' })

t.create('RGB color')
  .get(
    '/static/v1.svg?label=label&message=message&color=rgb(123,123,123)&style=_shields_test'
  )
  .expectJSON({ name: 'label', value: 'message', color: 'rgb(123,123,123)' })

t.create('All one color')
  .get(
    '/static/v1.svg?label=&messageall%20one%20color&color=red&style=_shields_test'
  )
  .expectJSON({ name: '', value: 'all one color', color: 'red' })

t.create('Not a valid color')
  .get(
    '/static/v1.svg?label=label&message=message&color=notacolor&style=_shields_test'
  )
  .expectJSON({ name: 'label', value: 'message', color: null })

t.create('Missing message')
  .get('/static/v1.svg?label=label&message=color=blue&style=_shields_test')
  .expectJSON({ name: 'label', value: '', color: 'blue' })

t.create('Missing label')
  .get('/static/v1.svg?label=&message=message&color=blue&style=_shields_test')
  .expectJSON({ name: '', value: 'message', color: 'blue' })

t.create('Case is preserved')
  .get('/static/v1.svg?label=LiCeNsE-mIt-blue&style=_shields_test')
  .expectJSON({ name: 'LiCeNsE', value: 'mIt', color: 'blue' })

t.create('"Shields-encoded" dash')
  .get(
    '/static/v1.svg?label=best-license&message=Apache-2.0&color=blue&style=_shields_test'
  )
  .expectJSON({ name: 'best-license', value: 'Apache-2.0', color: 'blue' })

t.create('Set color')
  .get(
    '/static/v1.svg?label=label&message=message&color=yellow&style=_shields_test'
  )
  .expectJSON({ name: 'label', value: 'message', color: 'yellow' })

t.create('Set color with a number')
  .get(
    '/static/v1.svg?label=label&message=message&color=123&style=_shields_test'
  )
  .expectJSON({ name: 'label', value: 'message', color: '#123' })

t.create('Set label')
  .get(
    '/static/v1.svg?label=mylabel&message=message&color=blue&style=_shields_test'
  )
  .expectJSON({ name: 'mylabel', value: 'message', color: 'blue' })
