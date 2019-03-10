'use strict'

const { isBuildStatus } = require('../build-status')
const t = (module.exports = require('../tester').createServiceTester())

t.create('netlify (valid)')
  .get('/0028c6a7-b7ae-49f6-b847-917b40b5b13f.json')
  .expectBadge({
    label: 'netlify',
    message: isBuildStatus,
  })

t.create('netlify (app not found)')
  .get('/does-not-exist.json')
  .expectBadge({ label: 'netlify', message: 'app not found' })
