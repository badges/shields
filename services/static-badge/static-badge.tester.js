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

t.create('All one color')
  .get('/badge/all%20one%20color-red.json?style=_shields_test')
  .expectJSON({ name: '', value: 'all one color', colorB: '#e05d44' })

t.create('Not a valid color')
  .get('/badge/label-message-notacolor.json?style=_shields_test')
  .expectJSON({ name: 'label', value: 'message', colorB: '#e05d44' })

t.create('Missing message')
  .get('/badge/label--blue.json?style=_shields_test')
  .expectJSON({ name: 'label', value: '', colorB: '#007ec6' })

t.create('Missing label')
  .get('/badge/-message-blue.json?style=_shields_test')
  .expectJSON({ name: '', value: 'message', colorB: '#007ec6' })

t.create('Case is preserved')
  .get('/badge/LiCeNsE-mIt-blue.json?style=_shields_test')
  .expectJSON({ name: 'LiCeNsE', value: 'mIt', colorB: '#007ec6' })

t.create('"Shields-encoded" dash')
  .get('/badge/best--license-Apache--2.0-blue.json?style=_shields_test')
  .expectJSON({ name: 'best-license', value: 'Apache-2.0', colorB: '#007ec6' })

t.create('Override colorB')
  .get('/badge/label-message-blue.json?style=_shields_test&colorB=yellow')
  .expectJSON({ name: 'label', value: 'message', colorB: '#dfb317' })

t.create('Override label')
  .get('/badge/label-message-blue.json?style=_shields_test&label=mylabel')
  .expectJSON({ name: 'mylabel', value: 'message', colorB: '#007ec6' })

t.create('Old static badge')
  .get('/foo/bar.png?color=blue', { followRedirect: false })
  .expectStatus(301)
  .expectHeader('Location', '/badge/foo-bar-blue.png')
