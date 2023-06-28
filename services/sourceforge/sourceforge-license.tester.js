import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('license (with existing index)')
  .get('/1/mingw.json')
  .expectBadge({ label: 'license', message: 'Public Domain' })

t.create('license with inexistent index')
  .get('/8/mingw.json')
  .expectBadge({ label: 'license', message: 'BSD License' })

t.create('license (project not found)')
  .get('/5/that-doesnt-exist.json')
  .expectBadge({ label: 'license', message: 'project not found' })
