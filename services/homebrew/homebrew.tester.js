'use strict'

const { isVPlusTripleDottedVersion } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('homebrew (valid)')
  .get('/cake.json')
  .expectBadge({
    label: 'homebrew',
    message: isVPlusTripleDottedVersion,
  })

t.create('homebrew (valid, mocked response)')
  .get('/cake.json')
  .intercept(nock =>
    nock('https://formulae.brew.sh')
      .get('/api/formula/cake.json')
      .reply(200, { versions: { stable: '0.23.0', devel: null, head: null } })
  )
  .expectBadge({ label: 'homebrew', message: 'v0.23.0' })

t.create('homebrew (not found)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'homebrew', message: 'not found' })
