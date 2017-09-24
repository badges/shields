'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'vscode-marketplace', title: 'VS Code Marketplace' });
module.exports = t;

t.create('downloads should be formatted. eg. 72M')
.get('/d/ritwickdey.LiveServer.json')
.expectJSONTypes(Joi.object().keys({
  name: Joi.equal('Downloads', 'downloads'),
  value: Joi.string().regex(/^[0-9]+[K|M]?$/i)
}));

t.create('rating should be formatted. eg. 4.25/5 (30)')
.get('/r/ritwickdey.LiveServer.json')
.expectJSONTypes(Joi.object().keys({
  name: Joi.equal('rating', 'Rating'),
  value: Joi.string().regex(/[0-5].[0-9]{2}\/5?\s*\([0-9]*\)$/)
}));

t.create('version should be formatted. eg. v7.2.5')
.get('/v/ritwickdey.LiveServer.json')
.expectJSONTypes(Joi.object().keys({
  name: Joi.equal('Visual Studio Marketplace'),
  value: Joi.string().regex(/^v[0-9]*.[0-9]*.[0-9]*$/)
}));
