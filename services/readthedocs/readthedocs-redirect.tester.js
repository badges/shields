import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('legacy project route')
  .get('/pip.svg')
  .expectRedirect('/readthedocs.org/pip.svg')

t.create('legacy version route')
  .get('/pip/stable.svg')
  .expectRedirect('/readthedocs.org/pip/stable.svg')
