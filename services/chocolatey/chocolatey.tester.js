import {
  isMetric,
  isVPlusDottedVersionNClauses,
  isVPlusDottedVersionNClausesWithOptionalSuffix,
} from '../test-validators.js'
import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'chocolatey',
  title: 'Chocolatey',
})

// downloads

t.create('total downloads (valid)').get('/dt/scriptcs.json').expectBadge({
  label: 'downloads',
  message: isMetric,
})

t.create('total downloads (not found)')
  .get('/dt/not-a-real-package.json')
  .expectBadge({ label: 'downloads', message: 'not found' })

// version

t.create('version (valid)').get('/v/scriptcs.json').expectBadge({
  label: 'chocolatey',
  message: isVPlusDottedVersionNClauses,
})

t.create('version (not found)')
  .get('/v/not-a-real-package.json')
  .expectBadge({ label: 'chocolatey', message: 'not found' })

// version (pre)

t.create('version (pre) (valid)')
  .get('/v/scriptcs.json?include_prereleases')
  .expectBadge({
    label: 'chocolatey',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
  })

t.create('version (pre) (not found)')
  .get('/v/not-a-real-package.json?include_prereleases')
  .expectBadge({ label: 'chocolatey', message: 'not found' })

t.create('version (legacy redirect: vpre)')
  .get('/vpre/scriptcs.svg')
  .expectRedirect('/chocolatey/v/scriptcs.svg?include_prereleases')
