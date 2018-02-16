'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');
const { invalidJSON } = require('./helpers/response-fixtures');

// const isBuildStatus = Joi.string().regex(/^(waiting|queued|processing|success|skipped|unstable|timeout|cancelled|failed|stopped)$/);

const t = new ServiceTester({ id: 'hhvm', title: 'hhvm status' });
module.exports = t;

t.create('get symfony status (default branch - not tested)')
    .get('/symfony/symfony.json')
    .expectJSONTypes(Joi.object().keys({ name: 'hhvm', value: 'not tested' }));

t.create('get yii status (default branch - partially tested)')
    .get('/yiisoft/yii.json')
    .expectJSON({ name: 'hhvm', value: 'partially tested' });

t.create('gets yii 1.1.19 status')
    .get('/yiisoft/yii/1.1.19.json')
    .expectJSON({ name: 'hhvm', value: 'partially tested' });

t.create('gets yii 1.1.666 status (invalid branch)')
    .get('/yiisoft/yii/1.1.666.json')
    .expectJSON({ name: 'hhvm', value: 'invalid' });

t.create('invalid package name')
    .get('/frodo/is-not-a-package.json')
    .expectJSON({ name: 'hhvm', value: 'invalid' });

t.create('hhvm status (connection error)')
  .get('/frodo/is-not-a-package.json')
  .networkOff()
  .expectJSON({name: 'hhvm', value: 'inaccessible'});
