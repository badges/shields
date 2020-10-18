'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

const validMessages = [
  'success',
  'error',
  'failure',
  'inactive',
  'in progress',
  'queued',
  'pending',
  'no status yet',
]
const isValidMessages = Joi.equal(...validMessages).required()

t.create('Deployments')
  .get('/badges/shields/shields-staging.json')
  .expectBadge({
    label: 'state',
    message: isValidMessages,
  })

t.create('Deployments (environment not found)')
  .get('/badges/shields/does-not-exist.json')
  .expectBadge({
    label: 'state',
    message: 'environment not found',
  })

t.create('Deployments (status not yet available)')
  .get('/badges/shields/shields-staging.json')
  .intercept(nock =>
    nock('https://api.github.com/')
      .post('/graphql')
      .reply(200, {
        data: {
          repository: { deployments: { nodes: [{ latestStatus: null }] } },
        },
      })
  )
  .expectBadge({
    label: 'state',
    message: 'no status yet',
  })
