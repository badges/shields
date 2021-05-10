'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'continuousphp',
  title: 'Continuousphp',
}))

t.create('no longer available (previously build status on default branch)')
  .get('/git-hub/doctrine/dbal.json')
  .expectBadge({
    label: 'continuousphp',
    message: 'no longer available',
  })

t.create('no longer available (previously build status on named branch)')
  .get('/git-hub/doctrine/dbal/develop.json')
  .expectBadge({
    label: 'continuousphp',
    message: 'no longer available',
  })
