import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'apm',
  title: 'Atom Package Manager',
  pathPrefix: '/apm',
})

t.create('Downloads')
  .get('/dm/vim-mode.json')
  .expectBadge({ label: 'downloads', message: 'no longer available' })

t.create('Version')
  .get('/v/vim-mode.json')
  .expectBadge({ label: 'apm', message: 'no longer available' })

t.create('License')
  .get('/l/vim-mode.json')
  .expectBadge({ label: 'license', message: 'no longer available' })
