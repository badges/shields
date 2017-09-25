'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'maintenance', title: 'Maintenance' });
module.exports = t;

// variables for testing
var now = new Date();
var current_year = now.getUTCFullYear();

t.create('yes last maintained 2016 (no)')
  .get('/yes/2016.json')
  .expectJSON({ name: 'maintained', value: 'no! (as of 2016)' });

t.create('no longer maintained 2017 (no)')
  .get('/no/2017.json')
  .expectJSON({ name: 'maintained', value: 'no! (as of 2017)' });

t.create('yes this year (yes)')
  .get('/yes/' + current_year + '.json')
  .expectJSON({ name: 'maintained', value: 'yes' });

t.create('until end of ' + current_year + ' (yes)')
  .get('/until end of ' + current_year + '/' + current_year + '.json')
  .expectJSON({ name: 'maintained', value: 'until end of ' + current_year });
