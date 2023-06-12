import { isVPlusDottedVersionNClauses } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('version (valid)').get('/flask.json').expectBadge({
  label: 'piwheels',
  message: isVPlusDottedVersionNClauses,
})

t.create('version (does not exist)').get('/doesn-not-exist.json').expectBadge({
  label: 'piwheels',
  message: 'package not found',
})
