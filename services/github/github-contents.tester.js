import Joi from 'joi'
import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'GithubContents',
  title: 'Github Contents',
  pathPrefix: '/github/contents',
})

t.create('Contents')
  .get('/expressjs/express/package.json')
  .expectBadge({
    label: 'contents',
    message: Joi.string().regex(/^{[\s\S]*"name":\s*"express"[\s\S]*}$/),
  })

t.create('Contents (branch)')
  .get('/expressjs/express/package.json?branch=master')
  .expectBadge({
    label: 'contents',
    message: Joi.string().regex(/^{[\s\S]*"name":\s*"express"[\s\S]*}$/),
  })

t.create('Contents (file not found)')
  .get('/expressjs/express/not-found.json')
  .expectBadge({
    label: 'contents',
    message: 'repo, branch or file not found',
  })

t.create('Contents (repo not found)')
  .get('/badges/helmets/package.json')
  .expectBadge({
    label: 'contents',
    message: 'repo, branch or file not found',
  }) 