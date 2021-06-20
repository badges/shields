import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Watchers')
  .get('/badges/shields.json')
  .expectBadge({
    label: 'watchers',
    message: Joi.number().integer().positive(),
    color: 'blue',
    link: [
      'https://github.com/badges/shields',
      'https://github.com/badges/shields/watchers',
    ],
  })

t.create('Watchers (repo not found)').get('/badges/helmets.json').expectBadge({
  label: 'watchers',
  message: 'repo not found',
})
