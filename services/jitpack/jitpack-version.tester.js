import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

// Github allows versions with chars, etc.
const isAnyV = Joi.string().regex(/^v.+$/)

t.create('version (groupId)')
  .get('/com.github.erayerdin/kappdirs.json')
  .expectBadge({ label: 'jitpack', message: isAnyV })

t.create('unknown package')
  .get('/com.github.some-bogus-user/project.json')
  .expectBadge({ label: 'jitpack', message: 'project not found or private' })
