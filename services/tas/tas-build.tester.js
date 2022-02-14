import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('tas build').get('/github/tasdemo/axios.json').expectBadge({
  label: 'TAS',
  message: Joi.string(),
})
