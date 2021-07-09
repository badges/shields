import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('license (valid)')
  .get('/AFNetworking.json')
  .expectBadge({ label: 'license', message: 'MIT' })

t.create('missing license')
  .get('/TespoTextField.json')
  .intercept(nock =>
    nock('https://trunk.cocoapods.org')
      .get('/api/v1/pods/TespoTextField/specs/latest')
      .reply(200, {
        version: '1.0.7',
        platforms: { ios: '8.0' },
      })
  )
  .expectBadge({ label: 'license', message: 'not specified' })

t.create('license (not found)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'license', message: 'not found' })
