import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('dependencies (valid repo)')
  .get('/github/dtolnay/syn.json')
  .expectBadge({
    label: 'dependencies',
    message: Joi.string(),
  })

t.create('dependencies (not found)')
  .get('/github/not-a-real-user/not-a-real-repo.json')
  .expectBadge({ label: 'dependencies', message: 'not found' })
