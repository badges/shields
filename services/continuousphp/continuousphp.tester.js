import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'continuousphp',
  title: 'Continuousphp',
})

t.create('no longer available (previously build status on default branch)')
  .get('/git-hub/doctrine/dbal.json')
  .expectBadge({
    label: 'continuousphp',
    message: 'no longer available',
  })

t.create('no longer available (previously build status on named branch)')
  .get('/git-hub/doctrine/dbal/develop.json')
  .expectBadge({
    label: 'continuousphp',
    message: 'no longer available',
  })
