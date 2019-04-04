'use strict'

const { isIntegerPercentage } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('code coverage')
  .get('/g/filp/whoops.json')
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('code coverage (branch)')
  .get('/g/PHPMailer/PHPMailer/master.json')
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })
