import { test, given } from 'sazerac'
import { renderBuildStatusBadge } from '../build-status.js'
import Buildbot from './buildbot.service.js'

describe('Buildbot service', function () {
  test(Buildbot.prototype.transform, () => {
    given({ builds: [{ complete: false, results: 0 }] }).expect({
      status: 'building',
    })
    given({ builds: [{ complete: true, results: 0 }] }).expect({
      status: 'passing',
    })
    given({ builds: [{ complete: true, results: 1 }] }).expect({
      status: 'unstable',
    })
    given({ builds: [{ complete: true, results: 2 }] }).expect({
      status: 'failing',
    })
    given({ builds: [{ complete: true, results: 3 }] }).expect({
      status: 'skipped',
    })
    given({ builds: [{ complete: true, results: 4 }] }).expect({
      status: 'failing',
    })
    given({ builds: [{ complete: true, results: 5 }] }).expect({
      status: 'building',
    })
    given({ builds: [{ complete: true, results: 6 }] }).expect({
      status: 'cancelled',
    })
    given({ builds: [] }).expectError('Not Found: no builds found')
  })

  test(Buildbot.render, () => {
    given({ status: 'unstable' }).expect({
      message: 'unstable',
      color: 'yellow',
    })
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
