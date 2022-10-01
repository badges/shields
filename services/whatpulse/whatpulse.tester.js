import Joi from 'joi'
import { createServiceTester } from '../tester.js'
import { isOrdinalNumber } from '../test-validators.js'
export const t = await createServiceTester()

t.create('WhatPulse user as user id, category not from Ranks')
  .get('/user/179734.json?category=DOWNLOAD')
  .expectBadge({ label: 'WhatPulse DOWNLOAD', message: Joi.string() })

t.create('WhatPulse user as user name, category from Ranks')
  .get('/user/jerone.json?category=rankS/UplOad')
  .expectBadge({ label: 'WhatPulse rankS/UplOad', message: isOrdinalNumber })

t.create('WhatPulse team as team id, category not from Ranks')
  .get('/team/1295.json?category=clicks')
  .expectBadge({ label: 'WhatPulse clicks', message: Joi.string() })

t.create('WhatPulse team as team name, category from Ranks')
  .get('/team/dutch%20power%20cows.json?category=RANKS/clickS')
  .expectBadge({ label: 'WhatPulse RANKS/clickS', message: isOrdinalNumber })

t.create('WhatPulse invalid category name')
  .get('/user/179734.json?category=nonExistentCategory')
  .expectBadge({ label: 'WhatPulse', message: 'invalid category' })

t.create(
  'WhatPulse incorrect user name - invalid response from WhatPulse (does not contain all of the Joi-required fields)'
)
  .get('/user/1797344444444444444.json?category=download')
  .expectBadge({ label: 'WhatPulse', message: 'invalid response data' })
