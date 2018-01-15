'use strict';

const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'gratipay', title: 'Gratipay' });
module.exports = t;

t.create('Receiving')
  .get('/Gratipay.json')
  .expectJSON({
    name: 'gratipay',
    value: 'no longer available',
  });
