import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Tag (latest by date)')
  .get('/fdroid/fdroidclient.json')
  .expectBadge({ label: 'tag', message: Joi.string(), color: 'blue' })

t.create('Tag (repo not found)')
  .get('/fdroid/nonexistant.json')
  .expectBadge({ label: 'tag', message: 'repo not found' })

t.create('Tag (no tags)')
  .get('/fdroid/fdroiddata.json')
  .expectBadge({ label: 'tag', message: 'no tags found' })
