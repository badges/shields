import { ServiceTester } from '../tester.js'
import { invalidJSON } from '../response-fixtures.js'
import { isMetric, isVPlusTripleDottedVersion } from '../test-validators.js'

export const t = new ServiceTester({
  id: 'apm',
  title: 'Atom Package Manager',
})

t.create('Downloads')
  .get('/dm/vim-mode.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('Version')
  .get('/v/vim-mode.json')
  .expectBadge({ label: 'apm', message: isVPlusTripleDottedVersion })

t.create('License')
  .get('/l/vim-mode.json')
  .expectBadge({ label: 'license', message: 'MIT' })

t.create('Downloads | Package not found')
  .get('/dm/notapackage.json')
  .expectBadge({ label: 'downloads', message: 'package not found' })

t.create('Version | Package not found')
  .get('/v/notapackage.json')
  .expectBadge({ label: 'apm', message: 'package not found' })

t.create('License | Package not found')
  .get('/l/notapackage.json')
  .expectBadge({ label: 'license', message: 'package not found' })

t.create('Invalid version')
  .get('/dm/vim-mode.json')
  .intercept(nock =>
    nock('https://atom.io')
      .get('/api/packages/vim-mode')
      .reply(200, '{"releases":{}}')
  )
  .expectBadge({ label: 'downloads', message: 'invalid response data' })

t.create('Invalid License')
  .get('/l/vim-mode.json')
  .intercept(nock =>
    nock('https://atom.io')
      .get('/api/packages/vim-mode')
      .reply(200, '{"metadata":{}}')
  )
  .expectBadge({ label: 'license', message: 'invalid response data' })

t.create('Unexpected response')
  .get('/dm/vim-mode.json')
  .intercept(nock =>
    nock('https://atom.io').get('/api/packages/vim-mode').reply(invalidJSON)
  )
  .expectBadge({ label: 'downloads', message: 'unparseable json response' })
