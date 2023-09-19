import { isVPlusDottedVersionNClauses } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('FlakeHub (valid)')
  .get('/f/DeterminateSystems/nuenv/badge')
  .expectBadge({
    label: 'flakehub',
    message: isVPlusDottedVersionNClauses,
  })

t.create('FlakeHub (valid)')
  .get('/f/DeterminateSystems/nuenv/badge')
  .intercept(nock =>
    nock('https://api.flakehub.com')
      .get('/f/DeterminateSystems/nuenv/badge')
      .reply(200, {
        latest: '0.1.160',
      }),
  )
  .expectBadge({ label: 'FlakeHub', message: '0.1.160' })

t.create('FlakeHub (not found)')
  .get('/f/DeterminateSystems/flakehub-this-will-never-exist-we-promise')
  .expectBadge({ label: 'FlakeHub', message: 'not found' })
