'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('[fixed] Passing Build')
  .get(
    '/jct/test-fixed-succeeding/master/8c9b519a0750095b9fea3d40b2645d8a0c24a2f3.json'
  )
  .expectBadge({
    label: 'build',
    message: 'passing',
  })

t.create('[fixed] Passing Build')
  .get('/nock/nock/nock/nock.json')
  .intercept(nock =>
    nock('https://api.appcenter.ms/v0.1/apps/')
      .get('/nock/nock/branches/nock/builds')
      .reply(200, [{ result: 'succeeded' }])
  )
  .expectBadge({
    label: 'build',
    message: 'passing',
  })

t.create('[fixed] Failing Build')
  .get(
    '/jct/test-fixed-failing/appcenter/8c9b519a0750095b9fea3d40b2645d8a0c24a2f3.json'
  )
  .expectBadge({
    label: 'build',
    message: 'failing',
  })

t.create('[fixed] Failing Build')
  .get('/nock/nock/nock/nock.json')
  .intercept(nock =>
    nock('https://api.appcenter.ms/v0.1/apps/')
      .get('/nock/nock/branches/nock/builds')
      .reply(200, [{ result: 'failed' }])
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
