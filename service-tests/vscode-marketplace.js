'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');
const {
  isVPlusTripleDottedVersion,
  isMetric
} = require('./helpers/validators');

const isVscodeRating = Joi.string().regex(/[0-5].[0-9]{2}\/5?\s*\([0-9]*\)$/);

const t = new ServiceTester({ id: 'vscode-marketplace', title: 'VS Code Marketplace' });
module.exports = t;

t.create('downloads should be formatted. eg. downloads|72M')
.get('/d/ritwickdey.LiveServer.json')
.expectJSONTypes(Joi.object().keys({ name: 'downloads', value: isMetric }));

t.create('downloads label should be changed to custom label. eg. Total Installs|72M')
.get('/d/ritwickdey.LiveServer.json?label="Total Installs"')
.expectJSONTypes(Joi.object().keys({ name: 'Total Installs', value: isMetric }));

t.create('rating should be formatted. eg. rating|4.25/5(30)')
.get('/r/ritwickdey.LiveServer.json')
.expectJSONTypes(Joi.object().keys({ name: 'rating', value: isVscodeRating }));

t.create('rating label should be changed to custom label. eg. My custom rating label|4.25/5(30)')
.get('/r/ritwickdey.LiveServer.json?label="My custom rating label"')
.expectJSONTypes(Joi.object().keys({
  name: 'My custom rating label',
  value: isVscodeRating
}));

t.create('version should be formatted. eg. Visual Studio Marketplace|v7.2.5')
.get('/v/ritwickdey.LiveServer.json')
.expectJSONTypes(Joi.object().keys({
  name: 'visual studio marketplace',
  value: isVPlusTripleDottedVersion
}));

t.create('version label should be changed to custom label. eg. VSM|v7.2.5')
.get('/v/ritwickdey.LiveServer.json?label=VSM')
.expectJSONTypes(Joi.object().keys({
  name: 'VSM',
  value: isVPlusTripleDottedVersion
}));
