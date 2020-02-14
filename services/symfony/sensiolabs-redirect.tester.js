'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'sensiolabs',
  title: 'SensioLabs',
}))

t.create('sensiolabs insight')
  .get('/i/45afb680-d4e6-4e66-93ea-bcfa79eb8a87.svg')
  .expectRedirect('/symfony/i/grade/45afb680-d4e6-4e66-93ea-bcfa79eb8a87.svg')
