'use strict'

const t = (module.exports = require('..').createServiceTester())

t.create('on gitter')
  .get('/nwjs/nw.js.json')
  .expectJSON({
    name: 'chat',
    value: 'on gitter',
  })
