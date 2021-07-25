import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('language count').get('/badges/shields.json').expectBadge({
  label: 'languages',
  message: Joi.number().integer().positive(),
})

t.create('language count (empty repo)')
  .get('/pyvesb/emptyrepo.json')
  .expectBadge({ label: 'languages', message: '0' })

t.create('language count (repo not found)')
  .get('/badges/helmets.json')
  .expectBadge({ label: 'languages', message: 'repo not found' })
