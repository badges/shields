import { ServiceTester } from '../tester.js'
import { isMetricOverTimePeriod } from '../test-validators.js'
export const t = new ServiceTester({
  id: 'AmoDownloads',
  title: 'AmoDownloads',
  pathPrefix: '/amo',
})

t.create('Weekly Downloads')
  .get('/dw/duckduckgo-for-firefox.json')
  .expectBadge({ label: 'downloads', message: isMetricOverTimePeriod })

t.create('Weekly Downloads (not found)')
  .get('/dw/not-a-real-plugin.json')
  .expectBadge({ label: 'downloads', message: 'not found' })

t.create('/d URL should return deprecated badge')
  .get('/d/dustman.json')
  .expectBadge({
    label: 'mozilla-add-on',
    message: 'https://github.com/badges/shields/pull/11583',
  })

t.create('Weekly Downloads (thunderbird)')
  .get('/dw/tbkeys-lite.json?registry=thunderbird')
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
  .expectBadge({ label: 'downloads', message: isMetricOverTimePeriod })
