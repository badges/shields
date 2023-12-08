import Joi from 'joi'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('language count (empty repo)')
  .get('/CanisHelix/shields-badge-test-empty.json')
  .expectBadge({
    label: 'languages',
    message: '0',
  })

t.create('language count')
  .get('/CanisHelix/shields-badge-test.json')
  .expectBadge({
    label: 'languages',
    message: Joi.number().integer().positive(),
  })

t.create('language count (self-managed)')
  .get('/go-gitea/gitea.json?gitea_url=https://gitea.example.com')
  .intercept(nock =>
    nock('https://gitea.example.com/')
      .get('/api/v1/repos/go-gitea/gitea/languages')
      .reply(200, { CPP: 500, SQL: 25 }),
  )
  .expectBadge({
    label: 'languages',
    message: Joi.number().integer().positive(),
  })

t.create('language count (user or repo not found)')
  .get('/CanisHelix/does-not-exist.json')
  .expectBadge({
    label: 'languages',
    message: 'user or repo not found',
  })
