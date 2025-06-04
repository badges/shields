import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

// This validator is only for cases where the crate is known to exist.
// It does not include 'unknown' or 'not found', as these test cases always use existing crates.
// For non-existent crates, use a separate validator in the relevant test case.
const validCrateMessageValidator = Joi.alternatives().try(
  Joi.valid('up to date', 'none', 'maybe insecure', 'insecure'),
  Joi.string().pattern(/outdated$/),
)

t.create('dependencies (valid crate, latest version)')
  .get('/syn/latest.json')
  .expectBadge({
    label: 'dependencies',
    message: validCrateMessageValidator,
  })

t.create('dependencies (valid crate with specific version)')
  .get('/syn/2.0.101.json')
  .expectBadge({
    label: 'dependencies',
    message: validCrateMessageValidator,
  })

t.create('dependencies (not found)')
  .get('/not-a-real-package/latest.json')
  .expectBadge({ label: 'dependencies', message: 'not found' })
