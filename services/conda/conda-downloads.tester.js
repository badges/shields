'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('downloads').get('/d/conda-forge/zlib.json').expectBadge({
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
