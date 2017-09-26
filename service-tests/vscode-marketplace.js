'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'vscode-marketplace', title: 'VS Code Marketplace' });
module.exports = t;

t.create('downloads should be formatted. eg. downloads|72M')
.get('/d/ritwickdey.LiveServer.json')
.expectJSONTypes(Joi.object().keys({
  name: Joi.equal('downloads'),
  value: Joi.string().regex(/^[0-9]+[K|M]?$/i)
}));

t.create('downloads label should be changed to custom label. eg. Total Installs|72M')
.get('/d/ritwickdey.LiveServer.json?label="Total Installs"')
.expectJSONTypes(Joi.object().keys({
  name: Joi.equal('Total Installs'),
  value: Joi.string().regex(/^[0-9]+[K|M]?$/i)
}));

t.create('rating should be formatted. eg. rating|4.25/5(30)')
.get('/r/ritwickdey.LiveServer.json')
.expectJSONTypes(Joi.object().keys({
  name: Joi.equal('rating'),
  value: Joi.string().regex(/[0-5].[0-9]{2}\/5?\s*\([0-9]*\)$/)
}));

t.create('rating label should be changed to custom label. eg. My custom rating label|4.25/5(30)')
.get('/r/ritwickdey.LiveServer.json?label="My custom rating label"')
.expectJSONTypes(Joi.object().keys({
  name: Joi.equal('My custom rating label'),
  value: Joi.string().regex(/[0-5].[0-9]{2}\/5?\s*\([0-9]*\)$/)
}));

t.create('version should be formatted. eg. Visual Studio Marketplace|v7.2.5')
.get('/v/ritwickdey.LiveServer.json')
.expectJSONTypes(Joi.object().keys({
  name: Joi.equal('visual studio marketplace'),
  value: Joi.string().regex(/^v[0-9]*.[0-9]*.[0-9]*$/)
}));

t.create('version label should be changed to custom label. eg. VSM|v7.2.5')
.get('/v/ritwickdey.LiveServer.json?label=VSM')
.expectJSONTypes(Joi.object().keys({
  name: Joi.equal('VSM'),
  value: Joi.string().regex(/^v[0-9]*.[0-9]*.[0-9]*$/)
}));
