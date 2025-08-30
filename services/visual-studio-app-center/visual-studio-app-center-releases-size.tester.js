import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'VisualStudioAppCenterReleasesSize',
  title: 'VisualStudioAppCenterReleasesSize',
  pathPrefix: '/visual-studio-app-center/releases/size',
})

t.create('8368844 bytes to 8.37 megabytes')
  .get('/nock/nock/nock.json')
  .expectBadge({
    label: 'size',
    message: 'no longer available',
  })

t.create('Valid Release')
  .get(
    '/jct/test-fixed-android-react/8c9b519a0750095b9fea3d40b2645d8a0c24a2f3.json',
  )
  .expectBadge({
    label: 'size',
    message: 'no longer available',
  })

t.create('Valid user, invalid project, valid API token')
  .get('/jcx/invalid/8c9b519a0750095b9fea3d40b2645d8a0c24a2f3.json')
  .expectBadge({
    label: 'size',
    message: 'no longer available',
  })

t.create('Invalid user, invalid project, valid API token')
  .get('/invalid/invalid/8c9b519a0750095b9fea3d40b2645d8a0c24a2f3.json')
  .expectBadge({
    label: 'size',
    message: 'no longer available',
  })

t.create('Invalid API Token').get('/invalid/invalid/invalid.json').expectBadge({
  label: 'size',
  message: 'no longer available',
})
