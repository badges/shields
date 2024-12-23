import Joi from 'joi'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('live CodeRabbitStats')
  .get('/prs/github/coderabbitai/ast-grep-essentials.json')
  .expectBadge({
    label: 'coderabbit reviews',
    message: Joi.number().min(0),
  })

t.create('live CodeRabbitStats demo repo')
  .get('/prs/github/coderabbitai/coderabbit-docs.json')
  .expectBadge({
    label: 'coderabbit reviews',
    message: Joi.number().min(0),
  })

t.create('live CodeRabbitStats nonexistent org')
  .get('/prs/github/not-valid/not-found.json')
  .expectBadge({
    label: 'coderabbit reviews',
    message: 'provider or repo not found',
  })

t.create('live CodeRabbitStats invalid repo')
  .get('/prs/github/coderabbitai/invalid-repo-name.json')
  .expectBadge({
    label: 'coderabbit reviews',
    message: 'provider or repo not found',
  })
