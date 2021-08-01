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
