import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('dependencies (valid crate, latest version)')
  .get('/syn/latest.json')
  .expectBadge({
    label: 'dependencies',
    message: Joi.string(),
  })

t.create('dependencies (valid crate with specific version)')
  .get('/syn/2.0.101.json')
  .expectBadge({
    label: 'dependencies',
    message: Joi.string(),
  })

t.create('dependencies (not found)')
  .get('/not-a-real-package/latest.json')
  .expectBadge({ label: 'dependencies', message: 'unknown' })
