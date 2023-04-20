import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('platform')
  .get('/guitarix.json')
  .expectBadge({ label: 'platform', message: Joi.string().required() })

t.create('platform (project not found)')
  .get('/that-doesnt-exist.json')
  .expectBadge({ label: 'platform', message: 'project not found' })
