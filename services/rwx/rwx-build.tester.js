import Joi from 'joi'
import { normalizeColor } from '../../badge-maker/lib/color.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const isRwxStatus = Joi.string().valid(
  'passing',
  'failing',
  'running',
  'queued',
  'timed out',
  'cancelled',
  'error',
  'debugging',
  'sandboxed',
  'unknown',
  'no runs',
)

const isShieldsColor = Joi.string().custom((value, helpers) => {
  if (normalizeColor(value) === undefined) {
    return helpers.error('any.invalid')
  }
  return value
}, 'shields color')

t.create('live endpoint returns a valid status payload')
  .get('/rwx.json?repo=rwx&branch=main&definition=.rwx/main.yml', {
    followRedirect: false,
  })
  .expectBadge({
    label: 'build',
    message: isRwxStatus,
    color: isShieldsColor,
  })

t.create('passing run')
  .get('/rwx.json?repo=cloud&branch=main&definition=.rwx/main.yml')
  .intercept(nock =>
    nock('https://cloud.rwx.com/')
      .get('/status_badges/rwx.json')
      .query({
        repo: 'cloud',
        branch: 'main',
        definition: '.rwx/main.yml',
      })
      .reply(200, {
        schemaVersion: 1,
        label: 'build',
        message: 'passing',
        color: 'brightgreen',
      }),
  )
  .expectBadge({ label: 'build', message: 'passing', color: 'brightgreen' })

t.create('failing run')
  .get('/rwx.json?repo=cloud&branch=main&definition=.rwx/main.yml')
  .intercept(nock =>
    nock('https://cloud.rwx.com/')
      .get('/status_badges/rwx.json')
      .query(true)
      .reply(200, {
        schemaVersion: 1,
        label: 'build',
        message: 'failing',
        color: 'red',
      }),
  )
  .expectBadge({ label: 'build', message: 'failing', color: 'red' })

t.create('unknown payload (private repo without token)')
  .get('/rwx.json?repo=private-repo&branch=main&definition=.rwx/main.yml')
  .intercept(nock =>
    nock('https://cloud.rwx.com/')
      .get('/status_badges/rwx.json')
      .query(true)
      .reply(200, {
        schemaVersion: 1,
        label: 'build',
        message: 'unknown',
        color: 'lightgrey',
      }),
  )
  .expectBadge({ label: 'build', message: 'unknown', color: 'lightgrey' })

t.create('label query param is forwarded and returned')
  .get('/rwx.json?repo=cloud&branch=main&definition=.rwx/main.yml&label=ci')
  .intercept(nock =>
    nock('https://cloud.rwx.com/')
      .get('/status_badges/rwx.json')
      .query({
        repo: 'cloud',
        branch: 'main',
        definition: '.rwx/main.yml',
        label: 'ci',
      })
      .reply(200, {
        schemaVersion: 1,
        label: 'ci',
        message: 'passing',
        color: 'brightgreen',
      }),
  )
  .expectBadge({ label: 'ci', message: 'passing', color: 'brightgreen' })

t.create('token query param is forwarded')
  .get('/rwx.json?repo=cloud&branch=main&definition=.rwx/main.yml&token=abc123')
  .intercept(nock =>
    nock('https://cloud.rwx.com/')
      .get('/status_badges/rwx.json')
      .query({
        repo: 'cloud',
        branch: 'main',
        definition: '.rwx/main.yml',
        token: 'abc123',
      })
      .reply(200, {
        schemaVersion: 1,
        label: 'build',
        message: 'passing',
        color: 'brightgreen',
      }),
  )
  .expectBadge({ label: 'build', message: 'passing', color: 'brightgreen' })

t.create('malformed upstream response surfaces invalid response')
  .get('/rwx.json?repo=cloud&branch=main&definition=.rwx/main.yml')
  .intercept(nock =>
    nock('https://cloud.rwx.com/')
      .get('/status_badges/rwx.json')
      .query(true)
      .reply(200, { schemaVersion: 1, label: 'build', message: 'passing' }),
  )
  .expectBadge({ label: 'build', message: 'invalid response data' })
