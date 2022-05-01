import Joi from 'joi'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('pub popularity (valid)')
  .get('/analysis_options.json')
  .expectBadge({
    label: 'popularity',
    message: Joi.string().regex(/^\d+%$/),
    color: 'brightgreen',
  })

t.create('pub popularity (not found)')
  .get('/analysisoptions.json')
  .expectBadge({
    label: 'popularity',
    message: 'not found',
    color: 'red',
  })

t.create('pub popularity (invalid)').get('/analysis-options.json').expectBadge({
  label: 'popularity',
  message: 'invalid',
  color: 'lightgrey',
})
