import { isVPlusDottedVersionNClauses } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('FlakeHub (valid)')
  .get('/flake/DeterminateSystems/nuenv')
  .expectBadge({
    label: 'flakehub',
    message: isVPlusDottedVersionNClauses,
  })

t.create('FlakeHub (valid)')
  .get('/flake/DeterminateSystems/nuenv')
  .intercept(nock =>
    nock('https://api.flakehub.com')
      .get('/badge/DeterminateSystems/nuenv')
      .reply(200, {
        latest: '0.1.160',
      }),
  )
  .expectBadge({ label: 'flakehub', message: '0.1.160' })

t.create('FlakeHub (not found)')
  .get('/flake/foo/bar')
  .expectBadge({ label: 'flakehub', message: 'not found' })
