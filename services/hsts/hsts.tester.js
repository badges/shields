'use strict'

const { ServiceTester } = require('..')
const label = 'hsts'

const t = (module.exports = new ServiceTester({
  id: 'hsts',
  title: 'HSTS Preload',
}))

t.create('gets the hsts status of github')
  .get('/github.com.json')
  .expectJSON({
    name: label,
    value: 'preloaded',
  })

t.create('gets the hsts status of httpforever')
  .get('/httpforever.com.json')
  .expectJSON({
    name: label,
    value: 'unknown',
  })

t.create('gets the status of an invalid uri')
  .get('/does-not-exist.json')
  .expectJSON({
    name: label,
    value: 'unknown',
  })

t.create('gets the hsts status of github (mock)')
  .get('/github.com.json')
  .intercept(nock =>
    nock('https://hstspreload.org')
      .get('/api/v2/status?domain=github.com')
      .reply(200, { name: 'github.com', status: 'preloaded', bulk: false })
  )
  .expectJSON({
    name: label,
    value: 'preloaded',
  })

t.create('gets the hsts status of httpforever (mock)')
  .get('/httpforever.com.json')
  .intercept(nock =>
    nock('https://hstspreload.org')
      .get('/api/v2/status?domain=httpforever.com')
      .reply(200, { name: 'httpforever.com', status: 'unknown', bulk: false })
  )
  .expectJSON({
    name: label,
    value: 'unknown',
  })

t.create('gets the hsts status of a pending site (mock)')
  .get('/pending.mock.json')
  .intercept(nock =>
    nock('https://hstspreload.org')
      .get('/api/v2/status?domain=pending.mock')
      .reply(200, { name: 'pending.mock', status: 'pending', bulk: false })
  )
  .expectJSON({
    name: label,
    value: 'pending',
  })

t.create('gets the status of an invalid uri (mock)')
  .get('/does-not-exist.json')
  .intercept(nock =>
    nock('https://hstspreload.org')
      .get('/api/v2/status?domain=does-not-exist')
      .reply(200, { name: 'does-not-exist', status: 'unknown', bulk: false })
  )
  .expectJSON({
    name: label,
    value: 'unknown',
  })
