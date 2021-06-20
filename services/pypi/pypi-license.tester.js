import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('license (valid, package version in request)')
  .get('/requests/2.18.4.json')
  .expectBadge({ label: 'license', message: 'Apache 2.0', color: 'green' })

t.create('license (valid, no package version specified)')
  .get('/requests.json')
  .expectBadge({ label: 'license', message: 'Apache 2.0', color: 'green' })

t.create('license (invalid)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'license', message: 'package or version not found' })

t.create('license (from trove classifier)')
  .get('/mapi.json')
  .intercept(nock =>
    nock('https://pypi.org')
      .get('/pypi/mapi/json')
      .reply(200, {
        info: {
          version: '1.2.3',
          license: '',
          classifiers: ['License :: OSI Approved :: MIT License'],
        },
        releases: {},
      })
  )
  .expectBadge({
    label: 'license',
    message: 'MIT',
    color: 'green',
  })

t.create('license (as acronym from trove classifier)')
  .get('/magma.json')
  .intercept(nock =>
    nock('https://pypi.org')
      .get('/pypi/magma/json')
      .reply(200, {
        info: {
          version: '1.2.3',
          license: '',
          classifiers: [
            'License :: OSI Approved :: GNU General Public License (GPL)',
          ],
        },
        releases: {},
      })
  )
  .expectBadge({
    label: 'license',
    message: 'GPL',
    color: 'orange',
  })
