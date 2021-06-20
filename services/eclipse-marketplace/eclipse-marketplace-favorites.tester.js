import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('favorites count').get('/notepad4e.json').expectBadge({
  label: 'favorites',
  message: Joi.number().integer().positive(),
})

t.create('favorites for unknown solution')
  .get('/this-does-not-exist.json')
  .expectBadge({
    label: 'favorites',
    message: 'solution not found',
  })
