'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('Succeeded Build')
  .get('/jct/test-1/master/8c9b519a0750095b9fea3d40b2645d8a0c24a2f3.json')
  .expectBadge({
    label: 'build',
    message: 'passing',
  })

t.create('Failed Build')
  .get(
    '/jct/test-1/origin-master/8c9b519a0750095b9fea3d40b2645d8a0c24a2f3.json'
  )
  .expectBadge({
    label: 'build',
    message: 'failing',
  })

t.create('Invalid Branch')
  .get('/jct/test-1/invalid/8c9b519a0750095b9fea3d40b2645d8a0c24a2f3.json')
  .expectBadge({
    label: 'build',
    message: 'no builds found',
  })

t.create('Invalid API Token')
  .get('/jct/test-1/master/invalid.json')
  .expectBadge({
    label: 'build',
    message: 'invalid token',
  })
