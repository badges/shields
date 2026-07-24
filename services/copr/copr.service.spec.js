import { test, given } from 'sazerac'
import Copr from './copr.service.js'

describe('Copr service', function () {
  test(Copr.prototype.transform, () => {
    given({ builds: { latest: { state: 'succeeded' } } }).expect({
      status: 'passing',
    })
    given({ builds: { latest: { state: 'failed' } } }).expect({
      status: 'failing',
    })
    given({ builds: { latest: { state: 'running' } } }).expect({
      status: 'building',
    })
    given({ builds: { latest: { state: 'canceled' } } }).expect({
      status: 'cancelled',
    })
    given({ builds: { latest: { state: 'skipped' } } }).expect({
      status: 'skipped',
    })
    given({ builds: { latest: { state: 'unknown-state' } } }).expectError(
      'Not Found: unknown build state',
    )
  })
})
