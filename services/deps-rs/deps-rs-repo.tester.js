import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

// This validator is only for cases where the repository is known to exist.
// It does not include 'unknown' or 'not found', as these test cases always use existing repositories.
// For non-existent or unknown repositories, use a separate validator in the relevant test case.
const validRepoMessageValidator = Joi.alternatives().try(
  Joi.valid('up to date', 'none', 'maybe insecure', 'insecure'),
  Joi.string().pattern(/outdated$/),
)

t.create('dependencies (valid repo)')
  .get('/github/dtolnay/syn.json')
  .expectBadge({
    label: 'dependencies',
    message: validRepoMessageValidator,
  })

t.create('dependencies (unknown)')
  .get('/github/not-a-real-user/not-a-real-repo.json')
  .expectBadge({ label: 'dependencies', message: 'unknown' })
