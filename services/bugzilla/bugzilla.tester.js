import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const bzBugStatus = Joi.equal(
  'unconfirmed',
  'new',
  'assigned',
  'fixed',
  'invalid',
  "won't fix",
  'duplicate',
  'works for me',
  'incomplete',
)

t.create('Bugzilla valid bug status').get('/996038.json').expectBadge({
  label: 'bug 996038',
  message: bzBugStatus,
})

t.create('Bugzilla valid bug status with custom baseUrl')
  .get('/12345.json?baseUrl=https://gcc.gnu.org/bugzilla')
  .expectBadge({
    label: 'bug 12345',
    message: bzBugStatus,
  })

t.create('Bugzilla invalid bug status')
  .get('/001.json')
  .expectBadge({ label: 'bugzilla', message: 'not found' })
