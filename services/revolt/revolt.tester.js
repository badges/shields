import Joi from 'joi'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('Server invite')
  .get('/Testers.json')
  .expectBadge({
    label: 'chat',
    message: Joi.string().regex(/^[0-9]+ members$/),
    color: 'brightgreen',
  })
