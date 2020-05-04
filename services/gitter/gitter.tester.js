'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('on gitter').get('/nwjs/nw.js.json').expectBadge({
  label: 'chat',
  message: 'on gitter',
})
