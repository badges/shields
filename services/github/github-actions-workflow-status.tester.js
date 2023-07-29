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
    message: 'repo or workflow not found',
  })

t.create('nonexistent workflow')
  .get('/actions/toolkit/not-a-real-workflow.yml.json')
  .expectBadge({
    label: 'build',
    message: 'repo or workflow not found',
  })

t.create('nonexistent branch')
  .get('/actions/toolkit/unit-tests.yml.json?branch=not-a-real-branch')
  .expectBadge({
    label: 'build',
    message: 'no status',
  })

t.create('nonexistent event')
  .get('/actions/toolkit/unit-tests.yml.json?event=not-a-real-event')
  .expectBadge({
    label: 'build',
    message: 'no status',
  })

t.create('numeric branch name')
  .get('/actions/toolkit/unit-tests.yml.json?branch=9999')
  .expectBadge({
    label: 'build',
    // the key thing we're testing here is that this doesn't fail with
    // "invalid query parameter: branch"
    message: 'no status',
  })

t.create('valid workflow')
  .get('/actions/toolkit/unit-tests.yml.json')
  .expectBadge({
    label: 'build',
    message: isWorkflowStatus,
  })

t.create('valid workflow (with branch)')
  .get('/actions/toolkit/unit-tests.yml.json?branch=main')
  .expectBadge({
    label: 'build',
    message: isWorkflowStatus,
  })

t.create('valid workflow (with event)')
  .get('/actions/toolkit/unit-tests.yml.json?event=push')
  .expectBadge({
    label: 'build',
    message: isWorkflowStatus,
  })

t.create('valid workflow with / in workflow name')
  .get('/chris48s/blogmarks/pages/pages-build-deployment.json')
  .expectBadge({
    label: 'build',
    message: isWorkflowStatus,
  })

t.create('valid workflow with special chars in workflow name')
  .get('/chris48s/test-workflows/special%3A%26chars.yml.json')
  .expectBadge({
    label: 'build',
    message: isWorkflowStatus,
  })
