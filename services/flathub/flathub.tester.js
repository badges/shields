import { isVPlusDottedVersionNClauses } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Flathub (valid)').get('/org.mozilla.firefox.json').expectBadge({
  label: 'flathub',
  message: isVPlusDottedVersionNClauses,
})

t.create('Flathub (valid)')
  .get('/org.mozilla.firefox.json')
  .intercept(nock =>
    nock('https://flathub.org')
      .get('/api/v1/apps/org.mozilla.firefox')
      .reply(200, {
        flatpakAppId: 'org.mozilla.firefox',
        currentReleaseVersion: '78.0.1',
      })
  )
  .expectBadge({ label: 'flathub', message: 'v78.0.1' })

t.create('Flathub (not found)')
  .get('/not.a.package.json')
  .expectBadge({ label: 'flathub', message: 'not found' })
