'use strict'

const t = (module.exports = require('../create-service-tester')())

t.create('on gitter')
  .get('/nwjs/nw.js.json')
  .expectJSON({
    name: 'chat',
    value: 'on gitter',
  })
