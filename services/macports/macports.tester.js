import { isVPlusTripleDottedVersion } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('macports (valid)').get('/proxy-audio-device.json').expectBadge({
  label: 'macports',
  message: isVPlusTripleDottedVersion,
})

t.create('macports (valid, mocked)')
  .get('/proxy-audio-device.json')
  .intercept(nock =>
    nock('https://ports.macports.org')
      .get('/api/v1/ports/proxy-audio-device/')
      .reply(200, { version: '1.0.7' }),
  )
  .expectBadge({ label: 'macports', message: 'v1.0.7' })

t.create('macports (not found)')
  .get('/not-a-real-package.json')
  .expectBadge({ label: 'macports', message: 'not found' })
