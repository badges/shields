'use strict'

const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('version (valid)').get('/Config-Augeas.json').expectBadge({
  label: 'cpan',
  message: isVPlusDottedVersionAtLeastOne,
})

t.create('version (version is a number rather than a string)')
  .get('/Config-Augeas.json')
  .intercept(nock =>
    nock('https://fastapi.metacpan.org')
      .get('/v1/release/Config-Augeas')
      .reply(200, {
        license: ['GPL'],
        version: 0.88,
      })
  )
  .expectBadge({
    label: 'cpan',
    message: 'v0.88',
  })

t.create('version (not found)').get('/not-a-package.json').expectBadge({
  label: 'cpan',
  message: 'not found',
})
