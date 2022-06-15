import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('License (valid)')
  .get('/l/author/TopAndDownButtonsEverywhere.json')
  .expectBadge({
    label: 'license',
    message: 'MIT',
  })

t.create('Licenses (multiple)')
  .get('/l/author/oujs_-_Meta_View.json')
  .expectBadge({
    label: 'license',
    message: 'GPL-3.0-or-later, CC-BY-NC-SA-4.0',
  })

t.create('License (not found)')
  .get('/l/author/NotAScript3.json')
  .expectBadge({ label: 'license', message: 'user or project not found' })
