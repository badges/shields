import Joi from 'joi'
import { isBuildStatus } from '../build-status.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('cirrus bad repo')
  .get('/github/unknown-identifier/unknown-repo.json')
  .expectBadge({ label: 'build', message: 'unknown' })

t.create('cirrus fully.valid')
  .get('/github/flutter/flutter.json')
  .expectBadge({
    label: 'build',
    message: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
  })
