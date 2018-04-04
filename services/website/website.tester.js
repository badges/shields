'use strict';

const ServiceTester = require('../service-tester');
const colorscheme = require('../../lib/colorscheme.json');
const mapValues = require('lodash.mapvalues');

const t = new ServiceTester({ id: 'website', title: 'website' });
module.exports = t;
const colorsB = mapValues(colorscheme, 'colorB');

t.create('status of http://shields.io')
  .get('/http/shields.io.json?style=_shields_test')
  .expectJSON({ name: 'website', value: 'online', colorB: colorsB.brightgreen });

t.create('status of https://shields.io')
  .get('/https/shields.io.json?style=_shields_test')
  .expectJSON({ name: 'website', value: 'online', colorB: colorsB.brightgreen });

t.create('status of nonexistent domain')
  .get('/https/shields-io.io.json?style=_shields_test')
  .expectJSON({ name: 'website', value: 'offline', colorB: colorsB.red });

t.create('status when network is off')
  .get('/http/shields.io.json?style=_shields_test')
  .networkOff()
  .expectJSON({ name: 'website', value: 'offline', colorB: colorsB.red });

t.create('custom online label, online message and online color')
  .get('-up-down-green-grey/http/online.com.json?style=_shields_test&label=homepage')
  .intercept(nock => nock('http://online.com')
    .head('/')
    .reply(200))
  .expectJSON({ name: 'homepage', value: 'up', colorB: colorsB.green });

t.create('custom offline message and offline color')
  .get('-up-down-green-grey/http/offline.com.json?style=_shields_test')
  .intercept(nock => nock('http://offline.com')
    .head('/')
    .reply(500))
  .expectJSON({ name: 'website', value: 'down', colorB: colorsB.grey });
