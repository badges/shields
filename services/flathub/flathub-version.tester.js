import { isVPlusDottedVersionNClauses } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Flathub Version (valid)')
  .get('/org.srb2.SRB2Kart-Saturn.json')
  .expectBadge({
    label: 'flathub',
    message: isVPlusDottedVersionNClauses,
  })

t.create('Flathub Version (valid)')
  .get('/org.mozilla.firefox.json')
  .intercept(nock =>
    nock('https://flathub.org')
      .get('/api/v2/appstream/org.mozilla.firefox')
      .reply(200, {
        releases: [
          {
            timestamp: '1715769600',
            version: '78.0.2',
          },
          {
            timestamp: '1715769601',
            version: '78.0.0',
          },
          {
            timestamp: '1715769602',
            version: '78.0.1',
          },
        ],
      }),
  )
  .expectBadge({ label: 'flathub', message: 'v78.0.1' })

t.create('Flathub Version (not found)')
  .get('/not.a.package.json')
  .expectBadge({ label: 'flathub', message: 'not found' })
