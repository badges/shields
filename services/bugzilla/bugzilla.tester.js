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

t.create('Bugzilla valid bug status').get('/996038.json').expectBadge({
  label: 'bug 996038',
  message: bzBugStatus,
})

t.create('Bugzilla valid bug status with custom baseUrl')
  .get('/545424.json?baseUrl=https://bugs.eclipse.org/bugs')
  .expectBadge({
    label: 'bug 545424',
    message: bzBugStatus,
  })

t.create('Bugzilla invalid bug status')
  .get('/102.json?baseUrl=https://bugzilla.gnome.org')
  .expectBadge({ label: 'bugzilla', message: 'not found' })
