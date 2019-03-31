'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'WaffleLabelRedirect',
  title: 'WaffleLabelRedirect',
  pathPrefix: '/waffle/label',
}))

t.create('waffle label redirect')
  .get('/waffleio/waffle.io.svg', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader('Location', '/waffle/label/waffleio/waffle.io/ready.svg')
