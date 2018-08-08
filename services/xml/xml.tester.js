'use strict';

const Joi = require('joi');
const { expect } = require('chai');
const ServiceTester = require('../service-tester');
const {
  isSemver,
} = require('../test-validators');

const colorscheme = require('../../lib/colorscheme.json');
const mapValues = require('lodash.mapvalues');

const colorsB = mapValues(colorscheme, 'colorB');

const t = new ServiceTester({ id: 'dynamic-xml', title: 'User Defined XML Source Data', pathPrefix: '/badge/dynamic/xml' });
module.exports = t;

t.create('Connection error')
  .get('.json?url=https://services.addons.mozilla.org/en-US/firefox/api/1.5/addon/707078&query=/addon/name&label=Package Name&style=_shields_test')
  .networkOff()
  .expectJSON({ name: 'Package Name', value: 'inaccessible', colorB: colorsB.red });

t.create('No URL specified')
  .get('.json?query=//name&label=Package Name&style=_shields_test')
  .expectJSON({ name: 'Package Name', value: 'no url specified', colorB: colorsB.red });

t.create('No query specified')
  .get('.json?url=https://services.addons.mozilla.org/en-US/firefox/api/1.5/addon/707078&label=Package Name&style=_shields_test')
  .expectJSON({ name: 'Package Name', value: 'no query specified', colorB: colorsB.red });

t.create('XML from url')
  .get('.json?url=https://services.addons.mozilla.org/en-US/firefox/api/1.5/addon/707078&query=/addon/name&style=_shields_test')
  .expectJSON({ name: 'custom badge', value: 'IndieGala Helper', colorB: colorsB.brightgreen });

t.create('XML from uri (support uri query paramater)')
  .get('.json?uri=https://services.addons.mozilla.org/en-US/firefox/api/1.5/addon/707078&query=/addon/name&style=_shields_test')
  .expectJSON({ name: 'custom badge', value: 'IndieGala Helper', colorB: colorsB.brightgreen });

t.create('XML from url (attribute)')
  .get('.json?url=https://services.addons.mozilla.org/en-US/firefox/api/1.5/addon/707078&query=/addon/reviews/@num')
  .expectJSONTypes(Joi.object().keys({
    name: 'custom badge',
    value: Joi.string().regex(/^\d+$/)
  }));

t.create('XML from url | multiple results')
  .get('.json?url=https://services.addons.mozilla.org/en-US/firefox/api/1.5/addon/707078&query=/addon/compatible_applications/application/name')
  .expectJSONTypes(Joi.object().keys({
    name: 'custom badge',
    value: Joi.string().regex(/^Firefox( for Android)?,\sFirefox( for Android)?$/)
  }));

t.create('XML from url | caching with new query params')
  .get('.json?url=https://services.addons.mozilla.org/en-US/firefox/api/1.5/addon/707078&query=/addon/version')
  .expectJSONTypes(Joi.object().keys({
    name: 'custom badge',
    value: isSemver
  }));

t.create('XML from url | with prefix & suffix & label')
  .get('.json?url=https://services.addons.mozilla.org/en-US/firefox/api/1.5/addon/707078&query=//version&prefix=v&suffix= dev&label=IndieGala Helper')
  .expectJSONTypes(Joi.object().keys({
    name: 'IndieGala Helper',
    value: Joi.string().regex(/^v\d+(\.\d+)?(\.\d+)?\sdev$/)
  }));

t.create('XML from url | query doesnt exist')
  .get('.json?url=https://services.addons.mozilla.org/en-US/firefox/api/1.5/addon/707078&query=/does/not/exist&style=_shields_test')
  .expectJSON({ name: 'custom badge', value: 'no result', colorB: colorsB.lightgrey });

t.create('XML from url | query doesnt exist (attribute)')
  .get('.json?url=https://services.addons.mozilla.org/en-US/firefox/api/1.5/addon/707078&query=/does/not/@exist&style=_shields_test')
  .expectJSON({ name: 'custom badge', value: 'no result', colorB: colorsB.lightgrey });

t.create('XML from url | invalid url')
  .get('.json?url=https://github.com/badges/shields/raw/master/notafile.xml&query=//version&style=_shields_test')
  .expectJSON({ name: 'custom badge', value: 'resource not found', colorB: colorsB.lightgrey });

t.create('XML from url | user color overrides default')
  .get('.json?url=https://services.addons.mozilla.org/en-US/firefox/api/1.5/addon/707078&query=/addon/name&colorB=10ADED&style=_shields_test')
  .expectJSON({ name: 'custom badge', value: 'IndieGala Helper', colorB: '#10ADED' });

t.create('XML from url | error color overrides default')
  .get('.json?url=https://github.com/badges/shields/raw/master/notafile.xml&query=//version&style=_shields_test')
  .expectJSON({ name: 'custom badge', value: 'resource not found', colorB: colorsB.lightgrey });

t.create('XML from url | error color overrides user specified')
  .get('.json?query=//version&colorB=10ADED&style=_shields_test')
  .expectJSON({ name: 'custom badge', value: 'no url specified', colorB: colorsB.red });

let headers;
t.create('XML from url | request should set Accept header')
  .get('.json?url=https://xml-test/api.xml&query=/name')
  .intercept(nock => nock('https://xml-test')
    .get('/api.xml')
    .reply(200, function (uri, requestBody) {
      headers = this.req.headers;
      return '<?xml version="1.0" encoding="utf-8" ?><name>dynamic xml</name>';
    })
  )
  .expectJSON({ name: 'custom badge', value: 'dynamic xml' })
  .after(function () {
    expect(headers).to.have.property('accept', 'application/xml, text/xml');
  });
