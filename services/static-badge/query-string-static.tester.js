'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('Missing message')
  .get('/static/v1.json?label=label&message=&color=blue&style=_shields_test')
  .expectBadge({
    label: 'label',
    message: 'invalid query parameter: message',
    color: 'red',
  })

t.create('Missing label')
  .get('/static/v1.json?label=&message=message&color=blue&style=_shields_test')
  .expectBadge({ label: '', message: 'message', color: 'blue' })

t.create('Case is preserved')
  .get(
    '/static/v1.json?label=LiCeNsE&message=mIt&color=blue&style=_shields_test'
  )
  .expectBadge({ label: 'LiCeNsE', message: 'mIt', color: 'blue' })

t.create('Set color')
  .get(
    '/static/v1.json?label=label&message=message&color=yellow&style=_shields_test'
  )
  .expectBadge({ label: 'label', message: 'message', color: 'yellow' })

t.create('Set color with a number')
  .get(
    '/static/v1.json?label=label&message=message&color=123&style=_shields_test'
  )
  .expectBadge({ label: 'label', message: 'message', color: '#123' })

t.create('Set label')
  .get(
    '/static/v1.json?label=mylabel&message=message&color=blue&style=_shields_test'
  )
  .expectBadge({ label: 'mylabel', message: 'message', color: 'blue' })
