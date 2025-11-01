import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'bitcomponents',
  title: 'BitComponents',
  pathPrefix: '/bit/collection/total-components',
})

t.create('collection').get('/ramda/ramda.json').expectBadge({
  label: 'bitcomponents',
  message: 'no longer available',
})
