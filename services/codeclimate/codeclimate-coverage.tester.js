import Joi from 'joi'
import { isIntegerPercentage } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

// Examples for this service can be found through the explore page:
// https://codeclimate.com/explore

t.create('test coverage percentage')
  .get('/coverage/codeclimate/codeclimate.json')
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('test coverage letter')
  .get('/coverage-letter/codeclimate/codeclimate.json')
  .expectBadge({
    label: 'coverage',
    message: Joi.equal('A', 'B', 'C', 'D', 'E', 'F'),
  })

t.create('test coverage when outer user repos query returns multiple items')
  .get('/coverage/codeclimate/codeclimate.json')
  .intercept(nock =>
    nock('https://api.codeclimate.com', { allowUnmocked: true })
      .get('/v1/repos?github_slug=codeclimate%2Fcodeclimate')
      .reply(200, {
        data: [
          {
            id: 'xxxxxxxxxxxx', // Fake repo id, which is expected to be ignored in favour of the one that does contain snapshot data.
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
            id: '558479d6e30ba034120008a9', // Real repo id for codeclimate/codeclimate. The test retrieves live data using the real test report id below.
            relationships: {
              latest_default_branch_snapshot: {
                data: null,
              },
              latest_default_branch_test_report: {
                data: {
                  id: '6463c8a3e3bc340001004bce',
                  type: 'test_reports',
                },
              },
            },
          },
        ],
      }),
  )
  .networkOn() // Combined with allowUnmocked: true, this allows the inner test reports query to go through.
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('test coverage percentage for non-existent repo')
  .get('/coverage/unknown/unknown.json')
  .expectBadge({
    label: 'coverage',
    message: 'repo not found',
  })

t.create('test coverage percentage for repo without test reports')
  .get('/coverage/angular/angular.json')
  .expectBadge({
    label: 'coverage',
    message: 'test report not found',
  })
