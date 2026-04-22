import { isVPlusDottedVersionAtLeastOne } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('version (valid)')
  .get('/git.json')
  .intercept(nock =>
    nock('https://ports.macports.org')
      .get('/api/v1/ports/git/')
      .reply(200, { version: '2.47.1' }),
  )
  .expectBadge({
    label: 'macports',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('version (not found)')
  .get('/not-a-real-port.json')
  .intercept(nock =>
    nock('https://ports.macports.org')
      .get('/api/v1/ports/not-a-real-port/')
      .reply(404),
  )
  .expectBadge({ label: 'macports', message: 'port not found' })
