import Joi from 'joi'
import { createServiceTester } from '../tester.js'
import { isOrdinalNumber } from '../test-validators.js'
export const t = await createServiceTester()

t.create('WhatPulse user as user id, category not from Ranks')
  .get('/uptime/user/179734.json')
  .expectBadge({ label: 'uptime', message: Joi.string() })

t.create('WhatPulse team as team name, category from Ranks')
  .get('/keys/team/dutch power cows.json?rank')
  .expectBadge({ label: 'keys', message: isOrdinalNumber })

t.create(
  'WhatPulse invalid category name (not one of the options from the dropdown for the WhatPulse`s badge modal)'
)
  .get('/UpTIMe/user/jerone.json')
  .expectBadge({ label: '404', message: 'badge not found' })

t.create('WhatPulse incorrect user name')
  .get('/uptime/user/NonExistentUsername.json')
  .expectBadge({ label: 'WhatPulse', message: 'invalid response data' })
