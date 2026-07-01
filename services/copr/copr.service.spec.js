import { test, given } from 'sazerac'
import { renderBuildStatusBadge } from '../build-status.js'
import Copr from './copr.service.js'

describe('Copr service', function () {
  test(Copr.prototype.packageUrl, () => {
    given({
      server: 'https://copr.fedorainfracloud.org',
      owner: 'msuchy',
      project: 'nanoblogger',
      package: 'nanoblogger',
    }).expect('https://copr.fedorainfracloud.org/api_3/package')
    given({
      server: 'https://copr.fedorainfracloud.org/',
      owner: '@copr',
      project: 'copr',
      package: 'copr-backend',
    }).expect('https://copr.fedorainfracloud.org/api_3/package')
  })

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

  test(Copr.render, () => {
    given({ status: 'passing' }).expect(
      renderBuildStatusBadge({ status: 'passing' }),
    )
    given({ status: 'failing' }).expect(
      renderBuildStatusBadge({ status: 'failing' }),
    )
    given({ status: 'building' }).expect(
      renderBuildStatusBadge({ status: 'building' }),
    )
  })
})
