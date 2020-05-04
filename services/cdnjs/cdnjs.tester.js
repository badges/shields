'use strict'

const { isVPlusTripleDottedVersion } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('cdnjs (valid)').get('/jquery.json').expectBadge({
  label: 'cdnjs',
  message: isVPlusTripleDottedVersion,
})

t.create('cdnjs (not found)')
  .get('/not-a-library.json')
  .expectBadge({ label: 'cdnjs', message: 'not found' })
