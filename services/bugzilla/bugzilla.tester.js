'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

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

t.create('Bugzilla valid bug status')
  .get('/996038.json')
  .expectBadge({
    label: 'bug 996038',
    message: bzBugStatus,
  })

t.create('Bugzilla invalid bug status')
  .get('/83548978974387943879.json')
  .expectBadge({ label: 'bugzilla', message: 'not found' })
