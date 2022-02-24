import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('tas tests').get('/github/tasdemo/axios.json').expectBadge({
  label: 'tests',
  message: Joi.string(),
})
