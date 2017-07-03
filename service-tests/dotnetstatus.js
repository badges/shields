'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({
  id: 'dotnetstatus',
  title: 'dotnet-status'
});
module.exports = t;

t.create('get nuget package status')
  .get('/gh/Research-Institute/json-api-dotnet-core/master/src/JsonApiDotNetCore/JsonApiDotNetCore.csproj.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('up-to-date'),
    value: Joi.equal('true', 'false', 'not found', 'invalid', 'inaccessible')
  }));
