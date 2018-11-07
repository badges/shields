'use strict'

const t = require('../create-service-tester')()
module.exports = t

t.create('Shields colorscheme color')
  .get('/badge/label-message-blue.json?style=_shields_test')
  .expectJSON({ name: 'label', value: 'message', colorB: '#007ec6' })

t.create('CSS named color')
  .get('/badge/label-message-whitesmoke.json?style=_shields_test')
  .expectJSON({ name: 'label', value: 'message', colorB: 'whitesmoke' })

t.create('RGB color')
  .get('/badge/label-message-rgb(123,123,123).json?style=_shields_test')
  .expectJSON({ name: 'label', value: 'message', colorB: 'rgb(123,123,123)' })

t.create('Not a valid color')
  .get('/badge/label-message-notacolor.json?style=_shields_test')
  .expectJSON({ name: 'label', value: 'message', colorB: '#e05d44' })

t.create('Missing message')
  .get('/badge/label--blue.json?style=_shields_test')
  .expectJSON({ name: 'label', value: '', colorB: '#007ec6' })

t.create('Missing label')
  .get('/badge/-message-blue.json?style=_shields_test')
  .expectJSON({ name: '', value: 'message', colorB: '#007ec6' })

t.create('Override colorB')
  .get('/badge/label-message-blue.json?style=_shields_test&colorB=yellow')
  .expectJSON({ name: 'label', value: 'message', colorB: '#dfb317' })

t.create('Override label')
  .get('/badge/label-message-blue.json?style=_shields_test&label=mylabel')
  .expectJSON({ name: 'mylabel', value: 'message', colorB: '#007ec6' })
