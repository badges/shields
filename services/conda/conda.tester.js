'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { isVPlusTripleDottedVersion, isMetric } = require('../test-validators')

const isCondaPlatform = Joi.string().regex(/^\w+-\d+( \| \w+-\d+)*$/)

const t = new ServiceTester({ id: 'conda', title: 'Conda' })
module.exports = t

t.create('version')
  .get('/v/conda-forge/zlib.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'conda|conda-forge',
      value: isVPlusTripleDottedVersion,
    })
  )

t.create('version (relabel)')
  .get('/v/conda-forge/zlib.json?label=123')
  .expectJSONTypes(
    Joi.object().keys({
      name: '123',
      value: isVPlusTripleDottedVersion,
    })
  )

t.create('version (skip prefix)')
  .get('/vn/conda-forge/zlib.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'conda-forge',
      value: isVPlusTripleDottedVersion,
    })
  )

t.create('version (skip prefix, relabel)')
  .get('/vn/conda-forge/zlib.json?label=123')
  .expectJSONTypes(
    Joi.object().keys({
      name: '123',
      value: isVPlusTripleDottedVersion,
    })
  )

t.create('platform')
  .get('/p/conda-forge/zlib.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'conda|platform',
      value: isCondaPlatform,
    })
  )

t.create('platform (skip prefix)')
  .get('/pn/conda-forge/zlib.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'platform',
      value: isCondaPlatform,
    })
  )

t.create('platform (skip prefix,relabel)')
  .get('/pn/conda-forge/zlib.json?label=123')
  .expectJSONTypes(Joi.object().keys({ name: '123', value: isCondaPlatform }))

t.create('downloads')
  .get('/d/conda-forge/zlib.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'conda|downloads',
      value: isMetric,
    })
  )

t.create('downloads (skip prefix)')
  .get('/dn/conda-forge/zlib.json')
  .expectJSONTypes(Joi.object().keys({ name: 'downloads', value: isMetric }))

t.create('downloads (skip prefix, relabel)')
  .get('/dn/conda-forge/zlib.json?label=123')
  .expectJSONTypes(Joi.object().keys({ name: '123', value: isMetric }))

t.create('unknown package')
  .get('/d/conda-forge/some-bogus-package-that-never-exists.json')
  .expectJSON({ name: 'conda', value: 'not found' })

t.create('unknown channel')
  .get('/d/some-bogus-channel-that-never-exists/zlib.json')
  .expectJSON({ name: 'conda', value: 'not found' })
