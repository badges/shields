'use strict'

const ServiceTester = require('../service-tester')
const { serverStartTime } = require('../../lib/server-config')

const t = new ServiceTester({ id: 'debug', title: 'Server Debug Badges' })
module.exports = t

t.create('start time')
  .get('/starttime.json')
  .expectJSON({ name: 'start time', value: serverStartTime.toUTCString() })
