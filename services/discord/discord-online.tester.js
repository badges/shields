import { createServiceTester } from '../tester.js'
import { withRegex } from '../test-validators.js'

export const t = await createServiceTester()

const isOnlineOfTotal = withRegex(
  /^(0|[1-9]\d*|[1-9]\.[1-9])[kMGTPEZY]?\/(0|[1-9]\d*|[1-9]\.[1-9])[kMGTPEZY]? online$/,
)

t.create('online and total for shields invite')
  .get('/HjJCwm5.json')
  .expectBadge({
    label: 'chat',
    message: isOnlineOfTotal,
    color: 'brightgreen',
  })

t.create('invalid invite')
  .get('/shields-badge-test-invalid-invite.json')
  .expectBadge({ label: 'chat', message: 'invalid invite' })

t.create('formats large counts')
  .get('/mocked-invite.json')
  .intercept(nock =>
    nock('https://discord.com/')
      .get('/api/v10/invites/mocked-invite')
      .query({ with_counts: 'true' })
      .reply(200, {
        approximate_presence_count: 1500,
        approximate_member_count: 20000,
      }),
  )
  .expectBadge({
    label: 'chat',
    message: '1.5k/20k online',
    color: 'brightgreen',
  })

t.create('zero online')
  .get('/mocked-invite.json')
  .intercept(nock =>
    nock('https://discord.com/')
      .get('/api/v10/invites/mocked-invite')
      .query({ with_counts: 'true' })
      .reply(200, {
        approximate_presence_count: 0,
        approximate_member_count: 10,
      }),
  )
  .expectBadge({
    label: 'chat',
    message: '0/10 online',
    color: 'brightgreen',
  })

t.create('invalid response')
  .get('/mocked-invite.json')
  .intercept(nock =>
    nock('https://discord.com/')
      .get('/api/v10/invites/mocked-invite')
      .query({ with_counts: 'true' })
      .reply(200, {}),
  )
  .expectBadge({ label: 'chat', message: 'invalid response data' })

t.create('server error')
  .get('/mocked-invite.json')
  .intercept(nock =>
    nock('https://discord.com/')
      .get('/api/v10/invites/mocked-invite')
      .query({ with_counts: 'true' })
      .reply(500, 'Something broke'),
  )
  .expectBadge({ label: 'chat', message: 'inaccessible' })
