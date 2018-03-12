'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');
const { invalidJSON } = require('./helpers/response-fixtures');
const isBuildStatus = Joi.string().regex(/^(passing|failed|no tests|scheduled|not run)$/);

const t = new ServiceTester({ id: 'circleci', title: 'Circle CI' });
module.exports = t;


t.create('circle ci (valid, without branch)')
  .get('/project/github/RedSparr0w/node-csgo-parser.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'build',
    value: isBuildStatus
  }));

t.create('circle ci (valid, with branch)')
  .get('/project/github/RedSparr0w/node-csgo-parser/master.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'build',
    value: isBuildStatus
  }));

t.create('circle ci (not found)')
  .get('/project/github/PyvesB/EmptyRepo.json')
  .expectJSON({name: 'build', value: 'Project not found'});

t.create('circle ci (connection error)')
  .get('/project/github/RedSparr0w/node-csgo-parser.json')
  .networkOff()
  .expectJSON({name: 'build', value: 'inaccessible'});

t.create('circle ci (unexpected response)')
  .get('/project/github/RedSparr0w/node-csgo-parser.json')
  .intercept(nock => nock('https://circleci.com')
    .get('/api/v1.1/project/github/RedSparr0w/node-csgo-parser?filter=completed&limit=1')
    .reply(invalidJSON)
  )
  .expectJSON({name: 'build', value: 'invalid'});
