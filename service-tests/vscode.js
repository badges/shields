'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'vscode', title: 'VS Code Marketplace' });
module.exports = t;

t.create('installs')
.get('/installs/ritwickdey.LiveServer.json')
.expectJSONTypes(Joi.object().keys({
  name: Joi.equal('Installs', 'installs'),
  value: Joi.string().regex(/^[0-9]+[K|M]?$/i)
}));

t.create('rating')
.get('/rating/ritwickdey.LiveServer.json')
.expectJSONTypes(Joi.object().keys({
  name: Joi.equal('rating', 'Rating'),
  value: Joi.string()
}));

t.create('version')
.get('/version/ritwickdey.LiveServer.json')
.expectJSONTypes(Joi.object().keys({
  name: Joi.equal('Visual Studio Marketplace'),
  value: Joi.string().regex(/^v[0-9]*.[0-9]*.[0-9]*$/)
}));
