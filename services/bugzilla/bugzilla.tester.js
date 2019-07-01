'use strict'

const Joi = require('@hapi/joi')
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

t.create('Bugzilla valid bug status (without path)')
  .get('/https/bugzilla.mozilla.org/996038.json')
  .expectBadge({
    label: 'bug 996038',
    message: bzBugStatus,
  })

t.create('Bugzilla valid bug status (with path)')
  .get('/https/bugs.eclipse.org/bugs/545424.json')
  .expectBadge({
    label: 'bug 545424',
    message: bzBugStatus,
  })

t.create('Bugzilla invalid bug status')
  .get('/https/bugzilla.gnome.org/83548978974387943879.json')
  .expectBadge({ label: 'bugzilla', message: 'not found' })
