import { createServiceTester } from '../tester.js'
import {
  isMetricFileSize,
  isHumanized,
  isMetric,
  isOrdinalNumber,
} from '../test-validators.js'
export const t = await createServiceTester()

t.create('WhatPulse user as user id, uptime')
  .get('/uptime/user/179734.json')
  .expectBadge({ label: 'uptime', message: isHumanized })

t.create('WhatPulse user as user name, keys')
  .get('/keys/user/jerone.json')
  .expectBadge({ label: 'keys', message: isMetric })

t.create('WhatPulse team as team id, clicks')
  .get('/clicks/team/1295.json')
  .expectBadge({ label: 'clicks', message: isMetric })

t.create('WhatPulse team as team id, download')
  .get('/download/team/1295.json')
  .expectBadge({ label: 'download', message: isMetricFileSize })

t.create('WhatPulse team as team id, upload')
  .get('/upload/team/1295.json')
  .expectBadge({ label: 'upload', message: isMetricFileSize })

t.create('WhatPulse team as team name, keys - from Ranks')
  .get('/keys/team/dutch power cows.json?rank')
  .expectBadge({ label: 'keys', message: isOrdinalNumber })

t.create(
  'WhatPulse invalid metric name (not one of the options from the modal`s dropdown)',
)
  .get('/UpTIMe/user/jerone.json')
  .expectBadge({ label: '404', message: 'badge not found' })

t.create('WhatPulse incorrect user name')
  .get('/uptime/user/NonExistentUsername.json')
  .expectBadge({ label: 'whatpulse', message: 'invalid response data' })
