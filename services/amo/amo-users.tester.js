import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Users')
  .get('/IndieGala-Helper.json')
  .expectBadge({ label: 'users', message: isMetric })

t.create('Users (not found)')
  .get('/not-a-real-plugin.json')
  .expectBadge({ label: 'users', message: 'not found' })

t.create('Users (thunderbird)')
  .get('/tbkeys-lite.json?registry=thunderbird')
  .intercept(nock =>
    nock('https://addons.thunderbird.net')
      .get('/api/v5/addons/addon/tbkeys-lite/')
      .reply(200, {
        average_daily_users: 1000,
        current_version: { version: '4.0.0' },
        ratings: { average: 4.5 },
        weekly_downloads: 200,
      }),
  )
  .expectBadge({ label: 'users', message: isMetric })
