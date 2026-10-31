import Joi from 'joi'
import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'wakatime',
  title: 'WakaTime',
})

const isCodingTime = Joi.string().regex(
  /^[\d,]+ (secs?|mins?|hrs?)( [\d,]+ mins?)?$/,
)

// Live tests: these hit the real WakaTime badge endpoints.
t.create('user coding time')
  .get('/user/66b6796d-eb84-4bb9-b9d2-8dc882f4c6ac.json')
  .expectBadge({ label: 'wakatime', message: isCodingTime })

t.create('project coding time')
  .get(
    '/user/b9fcf8ba-3fce-41a4-a480-d3fe6074a1ad/project/c9516ff1-10b9-41da-82fb-b86b24b0acc8.json',
  )
  .expectBadge({ label: 'wakatime', message: isCodingTime })

t.create('repo coding time')
  .get('/github/wakatime/sublime-wakatime.json')
  .expectBadge({ label: 'wakatime', message: isCodingTime })

t.create('unknown user')
  .get('/user/00000000-0000-0000-0000-000000000000.json')
  .expectBadge({ label: 'wakatime', message: 'not found' })

// Mocked tests: exercise the SVG parsing and error handling.
t.create('parses coding time from an SVG badge')
  .get('/user/test-id.json')
  .intercept(nock =>
    nock('https://wakatime.com')
      .get('/badge/user/test-id.svg')
      .reply(
        200,
        '<svg><text>wakatime</text><text>1,200 hrs 10 mins</text><a xlink:href="https://wakatime.com/"><rect/></a></svg>',
        { 'Content-Type': 'image/svg+xml' },
      ),
  )
  .expectBadge({ label: 'wakatime', message: '1,200 hrs 10 mins' })

t.create('unparseable svg response')
  .get('/user/test-id.json')
  .intercept(nock =>
    nock('https://wakatime.com')
      .get('/badge/user/test-id.svg')
      .reply(200, '<svg></svg>', { 'Content-Type': 'image/svg+xml' }),
  )
  .expectBadge({ label: 'wakatime', message: 'unparseable svg response' })
