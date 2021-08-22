import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('status of http://shields.io')
  .get('/website.json?url=http://shields.io')
  .timeout(7500)
  .expectBadge({ label: 'website', message: 'up', color: 'brightgreen' })

t.create('status of https://shields.io')
  .get('/website.json?url=https://shields.io')
  .timeout(7500)
  .expectBadge({ label: 'website', message: 'up', color: 'brightgreen' })

t.create('status of nonexistent domain')
  .get('/website.json?url=https://shields.io.io')
  .timeout(15000)
  .expectBadge({ label: 'website', message: 'down', color: 'red' })

t.create('status when network is off')
  .get('/website.json?url=https://shields.io')
  .networkOff()
  .expectBadge({ label: 'website', message: 'down', color: 'red' })

t.create('status is up if response code is 201')
  .get('/website.json?url=http://online.com')
  .intercept(nock => nock('http://online.com').head('/').reply(201))
  .expectBadge({ label: 'website', message: 'up' })

t.create('status is up if response code is 299')
  .get('/website.json?url=http://online.com')
  .intercept(nock => nock('http://online.com').head('/').reply(299))
  .expectBadge({ label: 'website', message: 'up' })

t.create('status is up if response code is 301')
  .get('/website.json?url=http://online.com')
  .intercept(nock => nock('http://online.com').head('/').reply(301))
  .expectBadge({ label: 'website', message: 'up' })

t.create('status is up if response code is 309')
  .get('/website.json?url=http://online.com')
  .intercept(nock => nock('http://online.com').head('/').reply(309))
  .expectBadge({ label: 'website', message: 'up' })

t.create('status is down if response code is 401')
  .get('/website.json?url=http://offline.com')
  .intercept(nock => nock('http://offline.com').head('/').reply(401))
  .expectBadge({ label: 'website', message: 'down' })

t.create('custom online label, online message and online color')
  .get(
    '/website.json?url=http://online.com&up_message=up&down_message=down&up_color=green&down_color=grey'
  )
  .intercept(nock => nock('http://online.com').head('/').reply(200))
  .expectBadge({ label: 'website', message: 'up', color: 'green' })

t.create('custom offline message and offline color')
  .get(
    '/website.json?url=http://offline.com&up_message=up&down_message=down&up_color=green&down_color=grey'
  )
  .intercept(nock => nock('http://offline.com').head('/').reply(500))
  .expectBadge({ label: 'website', message: 'down', color: 'grey' })
