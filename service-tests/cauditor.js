'use strict';

const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'cauditor', title: 'Cauditor' });
module.exports = t;

t.create('no longer available')
  .get('/mi/matthiasmullie/scrapbook/master.json?style=_shields_test')
  .expectJSON({
    name: 'cauditor',
    value: 'no longer available',
    colorB: '#9f9f9f',
  });