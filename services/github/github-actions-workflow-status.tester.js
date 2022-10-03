import Joi from 'joi'
import { isBuildStatus } from '../build-status.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const isWorkflowStatus = Joi.alternatives()
  .try(isBuildStatus, Joi.equal('no status'))
  .required()

t.create('nonexistent repo')
  .get('/badges/shields-fakeness/fake.yml.json')
  .expectBadge({
    label: 'build',
    message: 'repo, branch, or workflow not found',
  })

t.create('nonexistent workflow')
  .get('/actions/toolkit/not-a-real-workflow.yml.json')
  .expectBadge({
    label: 'build',
    message: 'repo, branch, or workflow not found',
  })

t.create('valid workflow')
  .get('/actions/toolkit/unit-tests.yml.json')
  .expectBadge({
    label: 'build',
    message: isWorkflowStatus,
  })

t.create('valid workflow (branch)')
  .get('/actions/toolkit/unit-tests.yml.json?branch=master.json')
  .expectBadge({
    label: 'build',
    message: isWorkflowStatus,
  })

t.create('valid workflow (event)')
  .get('/actions/toolkit/unit-tests.yml.json?event=push')
  .expectBadge({
    label: 'build',
    message: isWorkflowStatus,
  })
