import Joi from 'joi'
import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'wakatime',
  title: 'WakaTime',
})

const isCodingTime = Joi.string().regex(
  /^[\d,]+ (secs?|mins?|hrs?)( [\d,]+ mins?)?$/,
)

const sampleUserId = '12345678-1234-1234-1234-123456789012'
const sampleProjectId = '87654321-4321-4321-4321-210987654321'
const sampleSvg =
  '<svg><text>wakatime</text><text>1,200 hrs 10 mins</text><a xlink:href="https://wakatime.com/"><rect/></a></svg>'

// Live tests: these hit the real WakaTime badge endpoints.
t.create('user coding time')
  .get('/user/66b6796d-eb84-4bb9-b9d2-8dc882f4c6ac.json')
  .expectBadge({ label: 'wakatime', message: isCodingTime })

t.create('user coding time (username)')
  .get('/user/alan.json')
  .expectBadge({ label: 'wakatime', message: isCodingTime })

t.create('project coding time')
  .get(
    '/user/b9fcf8ba-3fce-41a4-a480-d3fe6074a1ad/project/c9516ff1-10b9-41da-82fb-b86b24b0acc8.json',
  )
  .expectBadge({ label: 'wakatime', message: isCodingTime })

t.create('project coding time (username)')
  .get('/user/kirb/project/c9516ff1-10b9-41da-82fb-b86b24b0acc8.json')
  .expectBadge({ label: 'wakatime', message: isCodingTime })

t.create('repo coding time')
  .get('/github/wakatime/sublime-wakatime.json')
  .expectBadge({ label: 'wakatime', message: isCodingTime })

t.create('unknown user')
  .get('/user/00000000-0000-0000-0000-000000000000.json')
  .expectBadge({ label: 'wakatime', message: 'not found' })

// Mocked tests: exercise the SVG parsing and error handling.
t.create('parses coding time from an SVG badge')
  .get(`/user/${sampleUserId}.json`)
  .intercept(nock =>
    nock('https://wakatime.com')
      .get(`/badge/user/${sampleUserId}.svg`)
      .reply(200, sampleSvg, { 'Content-Type': 'image/svg+xml' }),
  )
  .expectBadge({ label: 'wakatime', message: '1,200 hrs 10 mins' })

t.create('resolves a username to a user id')
  .get('/user/test-user.json')
  .intercept(nock =>
    nock('https://wakatime.com')
      .get('/api/v1/users/test-user')
      .reply(200, { data: { id: sampleUserId } })
      .get(`/badge/user/${sampleUserId}.svg`)
      .reply(200, sampleSvg, { 'Content-Type': 'image/svg+xml' }),
  )
  .expectBadge({ label: 'wakatime', message: '1,200 hrs 10 mins' })

t.create('resolves a username for a project badge')
  .get(`/user/test-user/project/${sampleProjectId}.json`)
  .intercept(nock =>
    nock('https://wakatime.com')
      .get('/api/v1/users/test-user')
      .reply(200, { data: { id: sampleUserId } })
      .get(`/badge/user/${sampleUserId}/project/${sampleProjectId}.svg`)
      .reply(200, sampleSvg, { 'Content-Type': 'image/svg+xml' }),
  )
  .expectBadge({ label: 'wakatime', message: '1,200 hrs 10 mins' })

t.create('unknown username')
  .get('/user/not-a-real-user.json')
  .intercept(nock =>
    nock('https://wakatime.com')
      .get('/api/v1/users/not-a-real-user')
      .reply(404, { error: 'Not found.' }),
  )
  .expectBadge({ label: 'wakatime', message: 'not found' })

t.create('invalid username response')
  .get('/user/invalid-user.json')
  .intercept(nock =>
    nock('https://wakatime.com')
      .get('/api/v1/users/invalid-user')
      .reply(200, { data: {} }),
  )
  .expectBadge({ label: 'wakatime', message: 'invalid response data' })

t.create('unparseable svg response')
  .get(`/user/${sampleUserId}.json`)
  .intercept(nock =>
    nock('https://wakatime.com')
      .get(`/badge/user/${sampleUserId}.svg`)
      .reply(200, '<svg></svg>', { 'Content-Type': 'image/svg+xml' }),
  )
  .expectBadge({ label: 'wakatime', message: 'unparseable svg response' })
