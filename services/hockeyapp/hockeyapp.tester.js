'use strict'

const createServiceTester = require('../create-service-tester')

const t = createServiceTester()
module.exports = t

t.create('Invalid AppToken')
.get('hockeyapp/v/1234/1234.json')
.expectJSONTypes({ name: 'version', value: 'invalid'})
