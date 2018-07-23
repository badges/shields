'use strict';

const ServiceTester = require('../service-tester');

const t = new ServiceTester({ id: 'static-badge', title: 'Static Badge', pathPrefix: '/badge' });
module.exports = t;


// version endpoint

t.create('Shields colorscheme color')
  .get('/label-message-blue.json?style=_shields_test')
  .expectJSON({name: 'label', value: 'message', colorB: '#007ec6'});

t.create('CSS named color')
  .get('/label-message-whitesmoke.json?style=_shields_test')
  .expectJSON({name: 'label', value: 'message', colorB: 'whitesmoke'});

t.create('RGB color')
  .get('/label-message-rgb(123,123,123).json?style=_shields_test')
  .expectJSON({name: 'label', value: 'message', colorB: 'rgb(123,123,123)'});

t.create('Not a valid color')
  .get('/label-message-notacolor.json?style=_shields_test')
  .expectJSON({name: 'label', value: 'message', colorB: '#e05d44'});

t.create('Missing message')
  .get('/label--blue.json?style=_shields_test')
  .expectJSON({name: 'label', value: 'n/a', colorB: '#007ec6'});

t.create('Missing label')
  .get('/-message-blue.json?style=_shields_test')
  .expectJSON({name: 'miscellaneous', value: 'message', colorB: '#007ec6'});

t.create('Override colorB')
  .get('/label-message-blue.json?style=_shields_test&colorB=yellow')
  .expectJSON({name: 'label', value: 'message', colorB: '#dfb317'});

t.create('Override label')
  .get('/label-message-blue.json?style=_shields_test&label=mylabel')
  .expectJSON({name: 'mylabel', value: 'message', colorB: '#007ec6'});
