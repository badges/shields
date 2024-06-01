import Joi from 'joi'
import { isIntegerPercentage } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

// Examples for this service can be found through the explore page:
// https://codeclimate.com/explore

t.create('issues count').get('/issues/tensorflow/models.json').expectBadge({
  label: 'issues',
  message: Joi.number().integer().positive(),
})

t.create('technical debt percentage')
  .get('/tech-debt/tensorflow/models.json')
  .expectBadge({
    label: 'technical debt',
    message: isIntegerPercentage,
  })

t.create('maintainability percentage')
  .get('/maintainability-percentage/tensorflow/models.json')
  .expectBadge({
    label: 'maintainability',
    message: isIntegerPercentage,
  })

t.create('maintainability letter')
  .get('/maintainability/tensorflow/models.json')
  .expectBadge({
    label: 'maintainability',
    message: Joi.equal('A', 'B', 'C', 'D', 'E', 'F'),
  })

t.create('issues when outer user repos query returns multiple items')
  .get('/issues/tensorflow/models.json')
  .intercept(nock =>
    nock('https://api.codeclimate.com')
      .get('/v1/repos?github_slug=tensorflow%2Fmodels')
      .reply(200, {
        data: [
          {
            id: 'xxxxxxxxxxxx', // Expected to be ignored in favour of the one that does contain snapshot data.
            relationships: {
              latest_default_branch_snapshot: {
                data: null,
              },
              latest_default_branch_test_report: {
                data: null,
              },
            },
          },
          {
            id: '57e2efacc718d40058000c9b',
            relationships: {
              latest_default_branch_snapshot: {
                data: {
                  id: '65ae115f34117d0001055101',
                  type: 'snapshots',
                },
              },
              latest_default_branch_test_report: {
                data: null,
              },
            },
          },
        ],
      })
      .get(
        '/v1/repos/57e2efacc718d40058000c9b/snapshots/65ae115f34117d0001055101',
      )
      .reply(200, {
        data: {
          attributes: {
            ratings: [
              {
                letter: 'D',
                measure: {
                  value: 24.73668395092537,
                },
              },
            ],
          },
          meta: {
            issues_count: 11538,
          },
        },
      }),
  )
  .expectBadge({
    label: 'issues',
    message: '11538',
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
  .get('/maintainability/tensorflow/models.json')
  .intercept(nock =>
    nock('https://api.codeclimate.com')
      .get('/v1/repos?github_slug=tensorflow%2Fmodels')
      .reply(200, {
        data: [{}], // No relationships in the list of data elements.
      }),
  )
  .expectBadge({
    label: 'analysis',
    message: 'invalid response data',
  })

t.create('malformed response for inner specific repo query')
  .get('/maintainability/tensorflow/models.json')
  .intercept(nock =>
    nock('https://api.codeclimate.com', { allowUnmocked: true })
      .get(/\/v1\/repos\/[a-z0-9]+\/snapshots\/[a-z0-9]+/)
      .reply(200, {}),
  ) // No data.
  .networkOn() // Combined with allowUnmocked: true, this allows the outer user repos query to go through.
  .expectBadge({
    label: 'analysis',
    message: 'invalid response data',
  })
