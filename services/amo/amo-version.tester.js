import { isVPlusDottedVersionAtLeastOne } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Version').get('/night-video-tuner.json').expectBadge({
  label: 'mozilla add-on',
  message: isVPlusDottedVersionAtLeastOne,
})

t.create('Version (not found)')
  .get('/not-a-real-plugin.json')
  .expectBadge({ label: 'mozilla add-on', message: 'not found' })

t.create('Version (thunderbird)')
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
  .expectBadge({
    label: 'mozilla add-on',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('Version (thunderbird, not found)')
  .get('/not-a-real-plugin.json?registry=thunderbird')
  .intercept(nock =>
    nock('https://addons.thunderbird.net')
      .get('/api/v5/addons/addon/not-a-real-plugin/')
      .reply(404),
  )
  .expectBadge({ label: 'mozilla add-on', message: 'not found' })
