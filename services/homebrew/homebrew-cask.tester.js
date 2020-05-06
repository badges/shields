'use strict'

const { isVPlusTripleDottedVersion } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('homebrew cask (valid)').get('/iterm2.json').expectBadge({
  label: 'homebrew cask',
  message: isVPlusTripleDottedVersion,
})

t.create('homebrew cask (valid)')
  .get('/iterm2.json')
  .intercept(nock =>
    nock('https://formulae.brew.sh')
      .get('/api/cask/iterm2.json')
      .reply(200, { version: '3.3.6' })
  )
  .expectBadge({ label: 'homebrew cask', message: 'v3.3.6' })

t.create('homebrew cask (not found)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'homebrew cask', message: 'not found' })
