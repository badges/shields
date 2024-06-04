import { isPercentage } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('module quality-score').get('/camptocamp/openssl.json').expectBadge({
  label: 'quality score',
  message: isPercentage,
})

t.create('module quality score (no ratings)')
  .get('/camptocamp/openssl.json')
  .intercept(nock =>
    nock('https://forgeapi.puppetlabs.com/private/validations')
      .get('/camptocamp-openssl')
      .reply(200, []),
  )
  .expectBadge({
    label: 'quality score',
    message: 'invalid response data',
  })

t.create('module quality score (not found)')
  .get('/notarealuser/notarealpackage.json')
  .expectBadge({
    label: 'quality score',
    message: 'not found',
  })
