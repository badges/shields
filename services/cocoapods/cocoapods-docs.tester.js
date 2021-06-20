import { isIntegerPercentage } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('doc percent (valid)').get('/AFNetworking.json').expectBadge({
  label: 'docs',
  message: isIntegerPercentage,
})

t.create('doc percent (null)')
  .get('/AFNetworking.json')
  .intercept(nock =>
    nock('https://metrics.cocoapods.org')
      .get('/api/v1/pods/AFNetworking')
      .reply(200, '{"cocoadocs": {"doc_percent": null}}')
  )
  .expectBadge({ label: 'docs', message: '0%' })

t.create('doc percent (not found)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'docs', message: 'not found' })
