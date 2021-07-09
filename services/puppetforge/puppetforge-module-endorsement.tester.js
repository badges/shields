import { withRegex } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('module endorsement')
  .get('/camptocamp/openssl.json')
  .expectBadge({
    label: 'endorsement',
    message: withRegex(/^approved|supported$/),
  })

t.create('module endorsement (no ratings)')
  .get('/camptocamp/openssl.json')
  .intercept(nock =>
    nock('https://forgeapi.puppetlabs.com/v3/modules')
      .get('/camptocamp-openssl')
      .reply(200, {
        endorsement: null,
        feedback_score: null,
        downloads: 0,
        current_release: { pdk: false, version: '1.0.0' },
      })
  )
  .expectBadge({
    label: 'endorsement',
    message: 'none',
  })

t.create('module endorsement (not found)')
  .get('/notarealuser/notarealpackage.json')
  .expectBadge({
    label: 'endorsement',
    message: 'not found',
  })
