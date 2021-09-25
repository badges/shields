import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('Server invite')
  .get('/revolt/invite/Testers')
  .expectBadge({ label: 'Revolt #Information & Rules' })
