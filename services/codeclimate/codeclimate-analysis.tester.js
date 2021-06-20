import Joi from 'joi'
import { isIntegerPercentage } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

// Examples for this service can be found through the explore page:
// https://codeclimate.com/explore

t.create('issues count').get('/issues/angular/angular.json').expectBadge({
  label: 'issues',
  message: Joi.number().integer().positive(),
})

t.create('technical debt percentage')
  .get('/tech-debt/angular/angular.json')
  .expectBadge({
    label: 'technical debt',
    message: isIntegerPercentage,
  })

t.create('maintainability percentage')
  .get('/maintainability-percentage/angular/angular.json')
  .expectBadge({
    label: 'maintainability',
    message: isIntegerPercentage,
  })

t.create('maintainability letter')
  .get('/maintainability/angular/angular.json')
  .expectBadge({
    label: 'maintainability',
    message: Joi.equal('A', 'B', 'C', 'D', 'E', 'F'),
  })

t.create('maintainability letter for non-existent repo')
  .get('/maintainability/unknown/unknown.json')
  .expectBadge({
    label: 'analysis',
    message: 'repo not found',
  })

t.create('maintainability letter for repo without snapshots')
  .get('/maintainability/kabisaict/flow.json')
  .expectBadge({
    label: 'analysis',
    message: 'snapshot not found',
  })

t.create('malformed response for outer user repos query')
  .get('/maintainability/angular/angular.json')
  .intercept(nock =>
    nock('https://api.codeclimate.com')
      .get('/v1/repos?github_slug=angular%2Fangular')
      .reply(200, {
        data: [{}], // No relationships in the list of data elements.
      })
  )
  .expectBadge({
    label: 'analysis',
    message: 'invalid response data',
  })

t.create('malformed response for inner specific repo query')
  .get('/maintainability/angular/angular.json')
  .intercept(nock =>
    nock('https://api.codeclimate.com', { allowUnmocked: true })
      .get(/\/v1\/repos\/[a-z0-9]+\/snapshots\/[a-z0-9]+/)
      .reply(200, {})
  ) // No data.
  .networkOn() // Combined with allowUnmocked: true, this allows the outer user repos query to go through.
  .expectBadge({
    label: 'analysis',
    message: 'invalid response data',
  })
