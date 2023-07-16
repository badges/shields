import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('score valid')
  .get('/github.com/rohankh532/org-workflow-add.json')
  .expectBadge({
    label: 'score',
    message: Joi.number().min(0),
    color: Joi.string().allow(
      'red',
      'yellow',
      'yellowgreen',
      'green',
      'brightgreen',
    ),
  })

t.create('score ivalid')
  .get('/github.com/invalid-user/invalid-repo.json')
  .expectBadge({
    label: 'score',
    message: 'invalid repo path',
    color: 'red',
  })
