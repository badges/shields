'use strict'

const ServiceTester = require('../service-tester')

const t = (module.exports = new ServiceTester({
  id: 'CoverityScan',
  title: 'Coverity Scan',
  pathPrefix: '/coverity/scan',
}))

t.create('extended downtime')
  .get('/3997.json')
  .expectJSON({
    name: 'coverity',
    value: 'extended downtime',
  })
