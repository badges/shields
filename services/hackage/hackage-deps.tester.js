import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('hackage deps (valid)')
  .get('/lens.json')
  .expectBadge({
    label: 'dependencies',
    message: Joi.string().regex(/^(up to date|outdated)$/),
  })

t.create('hackage deps (not found)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'dependencies', message: 'not found' })
