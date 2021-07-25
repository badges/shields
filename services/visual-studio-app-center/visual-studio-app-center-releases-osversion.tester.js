import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

// Note:
// Unfortunately an Invalid user, invalid project, valid API token test is not possible due to the way Microsoft cache their responses.
// For this reason 404 and 403 will instead both display 'project not found'

t.create('[fixed] Example Release')
  // This application will never have a new release created.
  .get(
    '/jct/test-fixed-android-react/8c9b519a0750095b9fea3d40b2645d8a0c24a2f3.json'
  )
  .expectBadge({
    label: 'android',
    message: '4.1+',
  })

t.create('Valid user, invalid project, valid API token')
  .get('/jcx/invalid/8c9b519a0750095b9fea3d40b2645d8a0c24a2f3.json')
  .expectBadge({
    label: 'min version',
    message: 'project not found',
  })

t.create('Invalid user, invalid project, valid API token')
  .get('/invalid/invalid/8c9b519a0750095b9fea3d40b2645d8a0c24a2f3.json')
  .expectBadge({
    label: 'min version',
    message: 'project not found',
  })

t.create('Invalid API Token').get('/invalid/invalid/invalid.json').expectBadge({
  label: 'min version',
  message: 'invalid token',
})
