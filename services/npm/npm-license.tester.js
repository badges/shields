import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('gets the license of express')
  .get('/express.json')
  .expectBadge({ label: 'license', message: 'MIT' })

t.create('gets the license of express from a custom registry')
  .get('/express.json?registry_uri=https://registry.npmjs.com')
  .expectBadge({ label: 'license', message: 'MIT' })

t.create('public domain license')
  .get('/redux-auth.json')
  .expectBadge({ label: 'license', message: 'WTFPL', color: '#7cd958' })

t.create('copyleft license')
  .get('/trianglify.json')
  .expectBadge({ label: 'license', message: 'GPL-3.0', color: 'orange' })

t.create('permissive license')
  .get('/express.json')
  .expectBadge({ label: 'license', message: 'MIT', color: 'green' })

t.create('permissive license for scoped package')
  .get('/@cycle%2Fcore.json')
  .expectBadge({ label: 'license', message: 'MIT', color: 'green' })

t.create(
  'permissive and copyleft licenses (SPDX license expression syntax version 2.0)'
)
  .get('/rho-cc-promise.json')
  .expectBadge({
    label: 'license',
    message: '(MPL-2.0 OR MIT)',
    color: 'lightgrey',
  })

t.create('license for package without a license property')
  .get('/package-without-license.json')
  .intercept(nock =>
    nock('https://registry.npmjs.org')
      .get('/package-without-license/latest')
      .reply(200, {
        label: 'package-without-license',
        maintainers: [],
      })
  )
  .expectBadge({ label: 'license', message: 'missing', color: 'red' })

t.create('license for package with a license object')
  .get('/package-license-object.json')
  .intercept(nock =>
    nock('https://registry.npmjs.org')
      .get('/package-license-object/latest')
      .reply(200, {
        label: 'package-license-object',
        license: {
          type: 'MIT',
          url: 'https://www.opensource.org/licenses/mit-license.php',
        },
        maintainers: [],
      })
  )
  .expectBadge({ label: 'license', message: 'MIT', color: 'green' })

t.create('license for package with a license array')
  .get('/package-license-array.json')
  .intercept(nock =>
    nock('https://registry.npmjs.org')
      .get('/package-license-array/latest')
      .reply(200, {
        label: 'package-license-object',
        license: ['MPL-2.0', 'MIT'],
        maintainers: [],
      })
  )
  .expectBadge({
    label: 'license',
    message: 'MPL-2.0, MIT',
    color: 'green',
  })

t.create('license for unknown package')
  .get('/npm-registry-does-not-have-this-package.json')
  .expectBadge({
    label: 'license',
    message: 'package not found',
    color: 'red',
  })

// This tests error-handling functionality in NpmBase.
t.create('when json is malformed for scoped package')
  .get('/@cycle%2Fcore.json')
  .intercept(nock =>
    nock('https://registry.npmjs.org')
      .get('/@cycle%2Fcore')
      .reply(200, {
        'dist-tags': {
          latest: '1.2.3',
        },
        versions: null,
      })
  )
  .expectBadge({
    label: 'license',
    message: 'invalid json response',
  })
