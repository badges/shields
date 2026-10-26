import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Existing package')
  .get('/http.json')
  .expectBadge({
    label: 'dart sdk',
    message: Joi.string()
      .regex(/^\^?\d/)
      .required(),
  })

t.create('Non-existent package')
  .get('/packagethatdoesnotexist123456.json')
  .expectBadge({
    label: 'dart sdk',
    message: 'not found',
  })
