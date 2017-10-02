'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({id: 'conda', title: 'Conda'});
module.exports = t;

t.create('version')
  .get('/v/conda-forge/zlib.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('conda|conda-forge'),
    value: Joi.string().regex(/^v\d+\.\d+\.\d+$/)
  }));

t.create('version (relabel)')
  .get('/v/conda-forge/zlib.json?label=123')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('123'),
    value: Joi.string().regex(/^v\d+\.\d+\.\d+$/)
  }));

t.create('version (skip prefix)')
  .get('/vn/conda-forge/zlib.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('conda-forge'),
    value: Joi.string().regex(/^v\d+\.\d+\.\d+$/)
  }));

t.create('version (skip prefix, relabel)')
  .get('/vn/conda-forge/zlib.json?label=123')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('123'),
    value: Joi.string().regex(/^v\d+\.\d+\.\d+$/)
  }));

t.create('platform')
  .get('/p/conda-forge/zlib.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('conda|platform'),
    value: Joi.string().regex(/^\w+-\d+( \| \w+-\d+)*$/)
  }));

t.create('platform (skip prefix)')
  .get('/pn/conda-forge/zlib.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('platform'),
    value: Joi.string().regex(/^\w+-\d+( \| \w+-\d+)*$/)
  }));

t.create('platform (skip prefix,relabel)')
  .get('/pn/conda-forge/zlib.json?label=123')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('123'),
    value: Joi.string().regex(/^\w+-\d+( \| \w+-\d+)*$/)
  }));

t.create('downloads')
  .get('/d/conda-forge/zlib.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('conda|downloads'),
    value: Joi.string().regex(/^[0-9]+[kMG]?$/)
  }));

t.create('downloads (skip prefix)')
  .get('/dn/conda-forge/zlib.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('downloads'),
    value: Joi.string().regex(/^[0-9]+[kMG]?$/)
  }));

t.create('downloads (skip prefix, relabel)')
  .get('/dn/conda-forge/zlib.json?label=123')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('123'),
    value: Joi.string().regex(/^[0-9]+[kMG]?$/)
  }));

t.create('unknown package')
  .get('/d/conda-forge/some-bogus-package-that-never-exists.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('conda|downloads'),
    value: Joi.equal('invalid')
  }));

t.create('unknown channel')
  .get('/d/some-bogus-channel-that-never-exists/zlib.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('conda|downloads'),
    value: Joi.equal('invalid')
  }));

t.create('unknown info')
  .get('/x/conda-forge/zlib.json')
  .expectStatus(404)
  .expectJSON({ name: '404', value: 'badge not found' });

t.create('connection error')
  .get('/d/conda-forge/zlib.json')
  .networkOff()
  .expectJSON({ name: 'conda|downloads', value: 'inaccessible' });
