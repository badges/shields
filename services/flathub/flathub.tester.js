'use strict'

const {
  isVPlusDottedVersionNClausesWithOptionalSuffixAndEpoch,
} = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Flathub (valid)')
  .get('/org.mozilla.firefox')
  .expectBadge({
    label: 'flathub',
    message: isVPlusDottedVersionNClausesWithOptionalSuffixAndEpoch,
  })

t.create('Flathub (valid)')
  .get('/org.mozilla.firefox')
  .intercept(nock =>
    nock('`https://flathub.org/')
      .get('/api/v1/apps/org.mozilla.firefox')
      .reply(200, {
        flatpakAppId: 'org.mozilla.firefox',
        currentReleaseVersion: '78.0.1',
      })
  )
  .expectBadge({ label: 'flathub', message: 'v78.0.1' })

t.create('Flathub (not found)')
  .get('/not.a.package')
  .expectBadge({ label: 'flathub', message: 'not found' })
