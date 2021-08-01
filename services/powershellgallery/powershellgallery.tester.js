import Joi from 'joi'
import { ServiceTester } from '../tester.js'
import {
  isMetric,
  isVPlusDottedVersionNClauses,
  isVPlusDottedVersionNClausesWithOptionalSuffix,
} from '../test-validators.js'
const isPlatform = Joi.string().regex(
  /^(windows|linux|macos)( \| (windows|linux|macos))*$/
)

export const t = new ServiceTester({
  id: 'powershellgallery',
  title: 'PowerShell Gallery',
})

t.create('total downloads (valid)').get('/dt/ACMESharp.json').expectBadge({
  label: 'downloads',
  message: isMetric,
})

t.create('total downloads (not found)')
  .get('/dt/not-a-real-package.json')
  .expectBadge({ label: 'downloads', message: 'not found' })

t.create('version (valid)').get('/v/ACMESharp.json').expectBadge({
  label: 'powershell gallery',
  message: isVPlusDottedVersionNClauses,
})

t.create('version (not found)')
  .get('/v/not-a-real-package.json')
  .expectBadge({ label: 'powershell gallery', message: 'not found' })

t.create('version (pre) (valid)')
  .get('/v/ACMESharp.json?include_prereleases')
  .expectBadge({
    label: 'powershell gallery',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
  })

t.create('version (pre) (not found)')
  .get('/v/not-a-real-package.json?include_prereleases')
  .expectBadge({ label: 'powershell gallery', message: 'not found' })

t.create('version (legacy redirect: vpre)')
  .get('/vpre/ACMESharp.svg')
  .expectRedirect('/powershellgallery/v/ACMESharp.svg?include_prereleases')

t.create('platform (valid').get('/p/DNS.1.1.1.1.json').expectBadge({
  label: 'platform',
  message: isPlatform,
})

t.create('platform (no tags)')
  .get('/p/ACMESharp.json')
  .expectBadge({ label: 'platform', message: 'not specified' })

t.create('platform (not found)')
  .get('/p/not-a-real-package.json')
  .expectBadge({ label: 'platform', message: 'not found' })
