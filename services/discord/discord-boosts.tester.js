import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('gets boosts for Reactiflux')
  .get('/reactiflux.json')
  .expectBadge({
    label: 'chat',
    message: Joi.string().regex(/^[0-9]+ boosts$/),
    color: 'brightgreen',
  })

t.create('invalid server invite ID')
  .get('/discord.json')
  .expectBadge({ label: 'chat', message: 'invalid server invite' })
