import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('dependencies (valid crate)').get('/syn.json').expectBadge({
  label: 'dependencies',
  message: Joi.string(),
})

t.create('dependencies (valid crate with version)')
  .get('/syn/2.0.101.json')
  .expectBadge({
    label: 'dependencies',
    message: Joi.string(),
  })

t.create('dependencies (not found)')
  .get('/not-a-real-package.json')
  .expectBadge({ label: 'dependencies', message: 'not found' })
