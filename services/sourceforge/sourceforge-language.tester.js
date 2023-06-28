import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('language (with existing index)')
  .get('/1/mingw.json')
  .expectBadge({ label: 'language', message: 'Pascal' })

t.create('language with inexistent index')
  .get('/8/mingw.json')
  .expectBadge({ label: 'language', message: 'Fortran' })

t.create('language (project not found)')
  .get('/5/that-doesnt-exist.json')
  .expectBadge({ label: 'language', message: 'project not found' })
