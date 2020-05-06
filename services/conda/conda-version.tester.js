'use strict'

const { isVPlusTripleDottedVersion } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('version').get('/v/conda-forge/zlib.json').expectBadge({
  label: 'conda|conda-forge',
  message: isVPlusTripleDottedVersion,
})

t.create('version (skip prefix)').get('/vn/conda-forge/zlib.json').expectBadge({
  label: 'conda-forge',
  message: isVPlusTripleDottedVersion,
})
