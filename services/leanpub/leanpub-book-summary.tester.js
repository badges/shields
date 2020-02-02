'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'LeanPub',
  title: 'LeanPub',
  pathPrefix: '/leanpub/book',
}))

t.create('no longer available (previously book pages)')
  .get('/pages/juice-shop.json')
  .expectBadge({
    label: 'leanpub',
    message: 'no longer available',
  })

t.create('no longer available (previously books sold)')
  .get('/sold/juice-shop.json')
  .expectBadge({
    label: 'leanpub',
    message: 'no longer available',
  })
