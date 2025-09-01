import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'VisualStudioAppCenterReleasesVersion',
  title: 'VisualStudioAppCenterReleasesVersion',
  pathPrefix: '/visual-studio-app-center/releases/version',
})

t.create('[fixed] Example Release')
  .get(
    '/jct/test-fixed-android-react/8c9b519a0750095b9fea3d40b2645d8a0c24a2f3.json',
  )
  .expectBadge({
    label: 'visualstudioappcenter',
    message: 'no longer available',
  })

t.create('Valid user, invalid project, valid API token')
  .get('/jcx/invalid/8c9b519a0750095b9fea3d40b2645d8a0c24a2f3.json')
  .expectBadge({
    label: 'visualstudioappcenter',
    message: 'no longer available',
  })

t.create('Invalid user, invalid project, valid API token')
  .get('/invalid/invalid/8c9b519a0750095b9fea3d40b2645d8a0c24a2f3.json')
  .expectBadge({
    label: 'visualstudioappcenter',
    message: 'no longer available',
  })

t.create('Missing Short Version').get('/nock/nock/nock.json').expectBadge({
  label: 'visualstudioappcenter',
  message: 'no longer available',
})

t.create('Invalid API Token').get('/invalid/invalid/invalid.json').expectBadge({
  label: 'visualstudioappcenter',
  message: 'no longer available',
})
