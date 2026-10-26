import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Existing project')
  .get('/starship.json')
  .expectBadge({
    label: 'repology',
    message: Joi.string().regex(/^v?\d/).required(),
  })

t.create('Non-existent project')
  .get('/invalidprojectthatshouldnotexist.json')
  .expectBadge({
    label: 'repology',
    message: 'not found',
  })
