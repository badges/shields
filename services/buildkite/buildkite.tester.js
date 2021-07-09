import Joi from 'joi'
import { isBuildStatus } from '../build-status.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('buildkite invalid pipeline')
  .get('/unknown-identifier/unknown-branch.json')
  .expectBadge({ label: 'build', message: 'not found' })

t.create('buildkite valid pipeline')
  .get('/3826789cf8890b426057e6fe1c4e683bdf04fa24d498885489/master.json')
  .expectBadge({
    label: 'build',
    message: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
  })

t.create('buildkite valid pipeline skipping branch')
  .get('/3826789cf8890b426057e6fe1c4e683bdf04fa24d498885489.json')
  .expectBadge({
    label: 'build',
    message: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
  })

t.create('buildkite unknown branch')
  .get(
    '/3826789cf8890b426057e6fe1c4e683bdf04fa24d498885489/unknown-branch.json'
  )
  .expectBadge({ label: 'build', message: 'unknown' })
