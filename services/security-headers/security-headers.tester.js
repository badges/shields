import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'security-headers',
  title: 'SecurityHeaders',
})

t.create('deprecated service').get('/security-headers.json').expectBadge({
  label: 'securityheaders',
  message: 'no longer available',
})
