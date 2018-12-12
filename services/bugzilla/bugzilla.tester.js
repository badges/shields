'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')

const bzBugStatus = Joi.equal(
  'unconfirmed',
  'new',
  'assigned',
  'fixed',
  'invalid',
  "won't fix",
  'duplicate',
  'works for me',
  'incomplete'
)

const t = (module.exports = new ServiceTester({
  id: 'bugzilla',
  title: 'Bugzilla',
}))

t.create('Bugzilla valid bug status')
  .get('/996038.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'bug 996038',
      value: bzBugStatus,
    })
  )

t.create('Bugzilla invalid bug status')
  .get('/83548978974387943879.json')
  .expectJSON({ name: 'bug 83548978974387943879', value: 'not found' })

t.create('Bugzilla failed request bug status')
  .get('/996038.json')
  .networkOff()
  .expectJSON({ name: 'bug 996038', value: 'inaccessible' })
