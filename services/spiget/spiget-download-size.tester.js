'use strict'

const { isFileSize } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('EssentialsX (id 9089)')
  .get('/9089.json')
  .expectBadge({ label: 'size', message: isFileSize })

t.create('Advanced Achievements (id 6239)')
  .get('/6239.json')
  .expectBadge({
    lavel: 'size',
    message: 'resource hosted externally',
  })

t.create('Invalid Resource (id 1)')
  .get('/1.json')
  .expectBadge({
    label: 'size',
    message: 'not found',
  })
