import Joi from 'joi'
import { isBuildStatus } from '../build-status.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const isWorkflowStatus = Joi.alternatives()
  .try(isBuildStatus, Joi.equal('no status'))
  .required()

t.create('missing branch param')
  .get('/actions/toolkit/unit-tests.yml.json')
  .expectBadge({
    label: 'build',
    message: 'invalid query parameter: branch',
  })

t.create('nonexistent repo')
  .get('/badges/shields-fakeness/fake.yml.json?branch=main')
  .expectBadge({
    label: 'build',
    message: 'repo or workflow not found',
  })

t.create('nonexistent workflow')
  .get('/actions/toolkit/not-a-real-workflow.yml.json?branch=main')
  .expectBadge({
    label: 'build',
    message: 'repo or workflow not found',
  })

t.create('nonexistent branch')
  .get('/actions/toolkit/unit-tests.yml.json?branch=not-a-real-branch')
  .expectBadge({
    label: 'build',
    message: 'branch or event not found',
  })

t.create('nonexistent event')
  .get(
    '/actions/toolkit/unit-tests.yml.json?branch=main&event=not-a-real-event'
  )
  .expectBadge({
    label: 'build',
    message: 'branch or event not found',
  })

t.create('valid workflow')
  .get('/actions/toolkit/unit-tests.yml.json?branch=main')
  .expectBadge({
    label: 'build',
    message: isWorkflowStatus,
  })

t.create('valid workflow (with event)')
  .get('/actions/toolkit/unit-tests.yml.json?branch=main&event=push')
  .expectBadge({
    label: 'build',
    message: isWorkflowStatus,
  })
