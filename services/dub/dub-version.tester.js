import Joi from 'joi'
import { isVPlusDottedVersionNClausesWithOptionalSuffix } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('version (valid)')
  .get('/vibe-d.json')
  .expectBadge({
    label: 'dub',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
    color: Joi.equal('blue', 'orange'),
  })

t.create('version (not found)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'dub', message: 'not found' })
