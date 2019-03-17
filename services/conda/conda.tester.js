'use strict'

const Joi = require('joi')
const { ServiceTester } = require('../tester')
const { isVPlusTripleDottedVersion, isMetric } = require('../test-validators')

const isCondaPlatform = Joi.string().regex(/^\w+-[\w\d]+( \| \w+-[\w\d]+)*$/)

const t = (module.exports = new ServiceTester({ id: 'conda', title: 'Conda' }))

t.create('version')
  .get('/v/conda-forge/zlib.json')
  .expectBadge({
    label: 'conda|conda-forge',
    message: isVPlusTripleDottedVersion,
  })

t.create('version (skip prefix)')
  .get('/vn/conda-forge/zlib.json')
  .expectBadge({
    label: 'conda-forge',
    message: isVPlusTripleDottedVersion,
  })

t.create('platform')
  .get('/p/conda-forge/zlib.json')
  .expectBadge({
    label: 'conda|platform',
    message: isCondaPlatform,
  })

t.create('platform (skip prefix)')
  .get('/pn/conda-forge/zlib.json')
  .expectBadge({
    label: 'platform',
    message: isCondaPlatform,
  })

t.create('downloads')
  .get('/d/conda-forge/zlib.json')
  .expectBadge({
    label: 'conda|downloads',
    message: isMetric,
  })

t.create('downloads (skip prefix)')
  .get('/dn/conda-forge/zlib.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('unknown package')
  .get('/d/conda-forge/some-bogus-package-that-never-exists.json')
  .expectBadge({ label: 'conda', message: 'not found' })

t.create('unknown channel')
  .get('/d/some-bogus-channel-that-never-exists/zlib.json')
  .expectBadge({ label: 'conda', message: 'not found' })
