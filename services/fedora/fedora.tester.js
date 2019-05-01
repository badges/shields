'use strict'

const {
  isVPlusDottedVersionNClausesWithOptionalSuffixAndEpoch,
} = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Fedora package (default branch, valid)')
  .get('/rpm.json')
  .expectBadge({
    label: 'fedora',
    message: isVPlusDottedVersionNClausesWithOptionalSuffixAndEpoch,
  })

t.create('Fedora package (not found)')
  .get('/rawhide/not-a-package.json')
  .expectBadge({ label: 'fedora', message: 'not found' })

t.create('Fedora package (branch not found)')
  .get('/not-a-branch/not-a-package.json')
  .expectBadge({ label: 'fedora', message: 'branch not found' })
