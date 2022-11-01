import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('package publisher').get('/path.json').expectBadge({
  label: 'publisher',
  message: 'dart.dev',
})

t.create('package not verified publisher').get('/utf.json').expectBadge({
  label: 'publisher',
  message: 'unverified',
  color: 'lightgrey',
})

t.create('invalid package name').get('/doesnotexist.json').expectBadge({
  label: 'publisher',
  message: 'invalid package name',
})
