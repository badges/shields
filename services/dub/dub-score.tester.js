import Joi from 'joi'
import { isWithinRange } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

const isScoreColor = Joi.equal(
  'red',
  'orange',
  'yellow',
  'yellowgreen',
  'green',
  'brightgreen',
)

t.create('version (valid)')
  .get('/vibe-d.json')
  .expectBadge({
    label: 'SCORE',
    message: isWithinRange(0, 5),
    color: isScoreColor,
  })

t.create('version (not found)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'SCORE', message: 'not found' })
