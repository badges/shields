import { isVPlusDottedVersionNClausesWithOptionalSuffix } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('version (valid)')
  .get('/java.json')
  .intercept(nock =>
    nock('https://api.sdkman.io')
      .get('/2/candidates/default/java')
      .reply(200, '21.0.2-tem'),
  )
  .expectBadge({
    label: 'sdkman',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
  })

t.create('version (not found)')
  .get('/not-a-real-sdk.json')
  .intercept(nock =>
    nock('https://api.sdkman.io')
      .get('/2/candidates/default/not-a-real-sdk')
      .reply(404),
  )
  .expectBadge({ label: 'sdkman', message: 'not found' })

t.create('version (empty response)')
  .get('/java.json')
  .intercept(nock =>
    nock('https://api.sdkman.io')
      .get('/2/candidates/default/java')
      .reply(200, ''),
  )
  .expectBadge({ label: 'sdkman', message: 'invalid response data' })
