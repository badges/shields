import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('on gitter').get('/nwjs/nw.js.json').expectBadge({
  label: 'chat',
  message: 'on gitter',
})
