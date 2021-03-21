'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'sensiolabs',
  title: 'SensioLabs',
}))

t.create('sensiolabs insight')
  .get('/i/15c5c748-f8d8-4b56-b536-a29a151aac6c.svg')
  .expectRedirect('/symfony/i/grade/15c5c748-f8d8-4b56-b536-a29a151aac6c.svg')
