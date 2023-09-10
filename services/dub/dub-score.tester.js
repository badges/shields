import Joi from 'joi'
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
    label: 'score',
    message: Joi.number().min(0).max(5),
    color: isScoreColor,
  })

t.create('version (not found)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'score', message: 'not found' })
