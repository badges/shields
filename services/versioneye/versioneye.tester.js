'use strict'

const { ServiceTester } = require('../tester')

const t = new ServiceTester({ id: 'versioneye', title: 'VersionEye' })
module.exports = t

t.create('no longer available (previously dependencies status)')
  .get('/d/ruby/rails.json')
  .expectBadge({
    label: 'versioneye',
    message: 'no longer available',
  })
