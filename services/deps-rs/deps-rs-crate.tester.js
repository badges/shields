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

t.create('dependencies (valid crate, latest version)')
  .get('/syn/latest.json')
  .expectBadge({
    label: 'dependencies',
    message: messageValidator,
  })

t.create('dependencies (valid crate with specific version)')
  .get('/syn/2.0.101.json')
  .expectBadge({
    label: 'dependencies',
    message: messageValidator,
  })

t.create('dependencies (not found)')
  .get('/not-a-real-package/latest.json')
  .expectBadge({ label: 'dependencies', message: 'not found' })
