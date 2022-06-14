import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'OpenUserJSLicense',
  title: 'OpenUserJS License',
  pathPrefix: '/openuserjs',
})

t.create('License (valid)')
  .get('/l/NatoBoram/YouTube_Comment_Blacklist.json')
  .expectBadge({
    label: 'license',
    message: 'GPL-3.0-or-later',
  })

t.create('Licenses (multiple)')
  .get('/l/Marti/oujs_-_Meta_View.json')
  .expectBadge({
    label: 'license',
    message: 'GPL-3.0-or-later, CC-BY-NC-SA-4.0',
  })

t.create('License (not found)')
  .get('/l/NotAUser/NotAScript.json')
  .expectBadge({ label: 'license', message: 'user or project not found' })
