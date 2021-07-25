import { isSemver } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('module version').get('/camptocamp/openssl.json').expectBadge({
  label: 'puppetforge',
  message: isSemver,
})

t.create('module version (not found)')
  .get('/notarealuser/notarealpackage.json')
  .expectBadge({
    label: 'puppetforge',
    message: 'not found',
  })
