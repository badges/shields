import { withRegex } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('existing zcash address')
  .get('/skyplabs.json')
  .expectBadge({
    label: 'zec',
    message: withRegex(/^(?!not found$)/),
  })

t.create('unknown username').get('/skyplabsssssss.json').expectBadge({
  label: 'zec',
  message: 'profile not found',
})

t.create('invalid username').get('/s.json').expectBadge({
  label: 'zec',
  message: 'invalid username',
})

t.create('missing zcash address').get('/test.json').expectBadge({
  label: 'zec',
  message: 'no zcash addresses found',
})
