'use strict';

const ServiceTester = require('../service-tester');

const t = new ServiceTester({ id: 'bithound', title: 'BitHound' });
module.exports = t;

t.create('no longer available (code)')
  .get('/code/github/rexxars/sse-channel.json')
  .expectJSON({
    name: 'bithound',
    value: 'no longer available'
  });

t.create('no longer available (dependencies)')
  .get('/dependencies/github/rexxars/sse-channel.json')
  .expectJSON({
    name: 'bithound',
    value: 'no longer available'
  });

t.create('no longer available (devDpendencies)')
  .get('/devDependencies/github/rexxars/sse-channel.json')
  .expectJSON({
    name: 'bithound',
    value: 'no longer available'
  });
