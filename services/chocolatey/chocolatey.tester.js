'use strict'

const {
  isMetric,
  isVPlusDottedVersionNClauses,
  isVPlusDottedVersionNClausesWithOptionalSuffix,
} = require('../test-validators')
const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'chocolatey',
  title: 'Chocolatey',
}))

// downloads

t.create('total downloads (valid)')
  .get('/dt/scriptcs.json')
  .expectBadge({
    label: 'downloads',
    message: isMetric,
  })

t.create('total downloads (not found)')
  .get('/dt/not-a-real-package.json')
  .expectBadge({ label: 'downloads', message: 'not found' })

// version

t.create('version (valid)')
  .get('/v/scriptcs.json')
  .expectBadge({
    label: 'chocolatey',
    message: isVPlusDottedVersionNClauses,
  })

t.create('version (not found)')
  .get('/v/not-a-real-package.json')
  .expectBadge({ label: 'chocolatey', message: 'not found' })

// version (pre)

t.create('version (pre) (valid)')
  .get('/vpre/scriptcs.json')
  .expectBadge({
    label: 'chocolatey',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
  })

t.create('version (pre) (not found)')
  .get('/vpre/not-a-real-package.json')
  .expectBadge({ label: 'chocolatey', message: 'not found' })
