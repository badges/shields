import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const messageValidator = Joi.alternatives().try(
  Joi.valid(
    'up to date',
    'none',
    'maybe insecure',
    'insecure',
    'unknown',
    'not found',
  ),
  Joi.string().pattern(/outdated$/),
)

t.create('dependencies (valid repo)')
  .get('/github/dtolnay/syn.json')
  .expectBadge({
    label: 'dependencies',
    message: messageValidator,
  })

t.create('dependencies (not found)')
  .get('/github/not-a-real-user/not-a-real-repo.json')
  .expectBadge({ label: 'dependencies', message: 'unknown' })
