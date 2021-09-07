import { ServiceTester } from '../tester.js'
import { noToken } from '../test-helpers.js'
import ObsService from './obs.service.js'
import { getIsMessageStatus } from './obs-build-status.js'

export const t = new ServiceTester({
  id: 'obs',
  title: 'openSUSE Open Build Service',
})

t.create('status (valid)')
  .skipWhen(noToken(ObsService))
  .get('/openSUSE:Factory/aaa_base/standard/x86_64.json')
  .expectBadge({
    label: 'standard',
    message: getIsMessageStatus(),
  })

t.create('status (invalid)')
  .skipWhen(noToken(ObsService))
  .get('/home:sp1rit/this_package_will_never_exist/repo/arch.json')
  .expectBadge({
    label: 'OBS',
    message: 'Package not found',
  })
