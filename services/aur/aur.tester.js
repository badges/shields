'use strict'

const { ServiceTester } = require('../tester')
const {
  isVPlusDottedVersionNClausesWithOptionalSuffix,
  isMetric,
} = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'aur',
  title: 'Arch Linux AUR',
}))

// version tests

t.create('version (valid)')
  .get('/version/dropbox.json')
  .expectBadge({
    label: 'aur',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
    color: 'blue',
  })

t.create('version (valid, out of date)')
  .get('/version/gog-gemini-rue.json')
  .expectBadge({
    label: 'aur',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
    color: 'orange',
  })

t.create('version (not found)')
  .get('/version/not-a-package.json')
  .expectBadge({ label: 'aur', message: 'package not found' })

// votes tests

t.create('votes (valid)')
  .get('/votes/discord.json')
  .expectBadge({
    label: 'votes',
    message: isMetric,
  })

t.create('votes (not found)')
  .get('/votes/not-a-package.json')
  .expectBadge({ label: 'votes', message: 'package not found' })

// license tests

t.create('license (valid)')
  .get('/license/pac.json')
  .expectBadge({ label: 'license', message: 'MIT' })

t.create('license (not found)')
  .get('/license/not-a-package.json')
  .expectBadge({ label: 'license', message: 'package not found' })
