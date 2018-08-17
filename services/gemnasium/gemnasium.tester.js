'use strict'

const ServiceTester = require('../service-tester')
const { expect } = require('chai')

const { isDeprecated } = require('../../lib/deprecation-helpers')

const t = new ServiceTester({ id: 'gemnasium', title: 'gemnasium' })
module.exports = t

t.create('no longer available (previously dependencies)')
  .get('/mathiasbynens/he.json')
  .afterJSON(badge => {
    if (isDeprecated('gemnasium')) {
      expect(badge.name).to.equal('gemnasium')
      expect(badge.value).to.equal('no longer available')
    } else {
      expect(badge.name).to.equal('dependencies')
    }
  })
