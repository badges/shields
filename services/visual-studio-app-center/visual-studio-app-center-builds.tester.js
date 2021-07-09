import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

// Mocked response rather than real data as old builds are deleted after some time.
t.create('Valid Build')
  .get('/nock/nock/master/token.json')
  .intercept(nock =>
    nock('https://api.appcenter.ms/v0.1/apps/')
      .get('/nock/nock/branches/master/builds')
      .reply(200, [
        {
          result: 'succeeded',
        },
      ])
  )
  .expectBadge({
    label: 'build',
    message: 'passing',
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
