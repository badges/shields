import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'VisualStudioAppCenterBuilds',
  title: 'VisualStudioAppCenterBuilds',
  pathPrefix: '/visual-studio-app-center/builds',
})

t.create('Valid Build').get('/nock/nock/master/token.json').expectBadge({
  label: 'visualstudioappcenter',
  message: 'no longer available',
})

t.create('Invalid Branch')
  .get('/jct/test-1/invalid/8c9b519a0750095b9fea3d40b2645d8a0c24a2f3.json')
  .expectBadge({
    label: 'visualstudioappcenter',
    message: 'no longer available',
  })

t.create('Invalid API Token')
  .get('/jct/test-1/master/invalid.json')
  .expectBadge({
    label: 'visualstudioappcenter',
    message: 'no longer available',
  })
