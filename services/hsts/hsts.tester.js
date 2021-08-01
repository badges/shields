import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()
const label = 'hsts preloaded'

t.create('gets the hsts status of github').get('/github.com.json').expectBadge({
  label,
  message: 'yes',
  color: 'brightgreen',
})

t.create('gets the hsts status of httpforever')
  .get('/httpforever.com.json')
  .expectBadge({
    label,
    message: 'no',
    color: 'red',
  })

t.create('gets the status of an invalid uri')
  .get('/does-not-exist.json')
  .expectBadge({
    label,
    message: 'no',
    color: 'red',
  })

t.create('gets the hsts status of github (mock)')
  .get('/github.com.json')
  .intercept(nock =>
    nock('https://hstspreload.org')
      .get('/api/v2/status?domain=github.com')
      .reply(200, { status: 'preloaded' })
  )
  .expectBadge({
    label,
    message: 'yes',
    color: 'brightgreen',
  })

t.create('gets the hsts status of httpforever (mock)')
  .get('/httpforever.com.json')
  .intercept(nock =>
    nock('https://hstspreload.org')
      .get('/api/v2/status?domain=httpforever.com')
      .reply(200, { status: 'unknown' })
  )
  .expectBadge({
    label,
    message: 'no',
    color: 'red',
  })

t.create('gets the hsts status of a pending site (mock)')
  .get('/pending.mock.json')
  .intercept(nock =>
    nock('https://hstspreload.org')
      .get('/api/v2/status?domain=pending.mock')
      .reply(200, { status: 'pending' })
  )
  .expectBadge({
    label,
    message: 'pending',
    color: 'yellow',
  })

t.create('gets the status of an invalid uri (mock)')
  .get('/does-not-exist.json')
  .intercept(nock =>
    nock('https://hstspreload.org')
      .get('/api/v2/status?domain=does-not-exist')
      .reply(200, { status: 'unknown' })
  )
  .expectBadge({
    label,
    message: 'no',
    color: 'red',
  })
