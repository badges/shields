import Joi from 'joi'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('pub points (valid)')
  .get('/analysis_options.json')
  .expectBadge({
    label: 'points',
    message: Joi.string().regex(/^\d+\/\d+$/),
  })

t.create('pub points (not found)').get('/analysisoptions.json').expectBadge({
  label: 'points',
  message: 'not found',
  color: 'red',
})
