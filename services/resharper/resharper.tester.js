'use strict'

const { ServiceTester } = require('../tester')
const {
  isMetric,
  isVPlusDottedVersionNClauses,
  isVPlusDottedVersionNClausesWithOptionalSuffix,
} = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'resharper',
  title: 'ReSharper',
}))

// downloads

t.create('total downloads (valid)').get('/dt/ReSharper.Nuke.json').expectBadge({
  label: 'downloads',
  message: isMetric,
})

t.create('total downloads (not found)')
  .get('/dt/not-a-real-package.json')
  .expectBadge({ label: 'downloads', message: 'not found' })

// version

t.create('version (valid)').get('/v/ReSharper.Nuke.json').expectBadge({
  label: 'resharper',
  message: isVPlusDottedVersionNClauses,
})

t.create('version (not found)')
  .get('/v/not-a-real-package.json')
  .expectBadge({ label: 'resharper', message: 'not found' })

// version (pre)

t.create('version (pre) (valid)')
  .get('/v/ReSharper.Nuke.json?include_prereleases')
  .expectBadge({
    label: 'resharper',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
  })

t.create('version (pre) (not found)')
  .get('/v/not-a-real-package.json?include_prereleases')
  .expectBadge({ label: 'resharper', message: 'not found' })

t.create('version (legacy redirect: vpre)')
  .get('/vpre/ReSharper.Nuke.svg')
  .expectRedirect('/resharper/v/ReSharper.Nuke.svg?include_prereleases')
