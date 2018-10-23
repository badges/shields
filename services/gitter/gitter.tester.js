'use strict'

const createServiceTester = require('../create-service-tester')
const t = createServiceTester()

module.exports = t

t.create('on gitter')
  .get('/room/nwjs/nw.js.json')
  .expectJSON({
    name: 'chat',
    value: 'on gitter',
  })
