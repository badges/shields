import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'cirrus',
  title: 'Cirrus CI',
  pathPrefix: '/cirrus',
})

t.create('default branch').get('/github/flutter/flutter.json').expectBadge({
  label: 'build',
  message: 'retired badge',
})

t.create('specific branch')
  .get('/github/flutter/flutter/master.json')
  .expectBadge({
    label: 'build',
    message: 'retired badge',
  })
