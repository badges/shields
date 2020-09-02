'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'OffsetEarthTreesRedirect',
  title: 'Offset Earth (Trees) Redirector',
  pathPrefix: '/offset-earth',
}))

t.create('Offset Earth trees alias')
  .get('/trees/ecologi.svg')
  .expectRedirect('/ecologi/trees/ecologi.svg')
