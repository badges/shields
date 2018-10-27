'use strict'

const ServiceTester = require('../service-tester')

const t = new ServiceTester({ id: 'versioneye', title: 'VersionEye' })
module.exports = t

t.create('no longer available (previously dependencies status)')
  .get('/d/ruby/rails.json')
  .expectJSON({
    name: 'versioneye',
    value: 'no longer available',
  })
