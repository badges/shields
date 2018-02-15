'use strict';

const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'cauditor', title: 'Cauditor' });
module.exports = t;

t.create('no longer available')
  .get('/mi/matthiasmullie/scrapbook/master.json')
  .expectJSON({
    name: 'cauditor',
    value: 'no longer available',
  });