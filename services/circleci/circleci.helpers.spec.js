'use strict'

const Joi = require('joi')
const { test, given } = require('sazerac')
const { expect } = require('chai')
const {
  circleSchema,
  getLatestCompleteBuildOutcome,
  summarizeBuildsForLatestCompleteWorkflow,
} = require('./circleci.helpers.js')

describe('circleci: getLatestCompleteBuildOutcome() function', function() {
  test(getLatestCompleteBuildOutcome, () => {
    given([{ outcome: 'success' }]).expect('passing')
    given([{ outcome: 'no_tests' }]).expect('no tests')
    given([{ outcome: 'failed' }]).expect('failed')

    given([{ outcome: 'success' }, { outcome: 'failed' }]).expect('passing')
    given([{ outcome: null }, { outcome: 'failed' }]).expect('failed')

    expect(() => getLatestCompleteBuildOutcome([{ outcome: null }])).to.throw(
      Error,
      'No complete builds found'
    )
    expect(() => getLatestCompleteBuildOutcome([{}])).to.throw(
      Error,
      'No complete builds found'
    )
    expect(() => getLatestCompleteBuildOutcome([])).to.throw(
      Error,
      'No complete builds found'
    )
  })
})

describe('circleci: summarizeBuildsForLatestCompleteWorkflow() function', function() {
  test(summarizeBuildsForLatestCompleteWorkflow, () => {
    given([
      // these 2 successful builds are part of the same workflow
      {
        outcome: 'success',
        workflows: { workflow_id: 'aaaaaaaa-1111-aaaa-1111-aaaaaaaaaaaa' },
      },
      {
        outcome: 'success',
        workflows: { workflow_id: 'aaaaaaaa-1111-aaaa-1111-aaaaaaaaaaaa' },
      },
      // this failed build is part of a different workflow
      {
        outcome: 'failed',
        workflows: { workflow_id: 'bbbbbbbb-1111-aaaa-1111-aaaaaaaaaaaa' },
      },
    ]).expect('passing')

    given([
      // this workflow contains 3 builds: 2 passing builds and one which failed
      {
        outcome: 'success',
        workflows: { workflow_id: 'aaaaaaaa-1111-aaaa-1111-aaaaaaaaaaaa' },
      },
      {
        outcome: 'success',
        workflows: { workflow_id: 'aaaaaaaa-1111-aaaa-1111-aaaaaaaaaaaa' },
      },
      {
        outcome: 'failed',
        workflows: { workflow_id: 'aaaaaaaa-1111-aaaa-1111-aaaaaaaaaaaa' },
      },
      // we should summarize the status of this build as 'failed'
    ]).expect('failed')

    given([
      // not all of the builds in the most recent wokflow are complete
      {
        outcome: 'success',
        workflows: { workflow_id: 'aaaaaaaa-1111-aaaa-1111-aaaaaaaaaaaa' },
      },
      {
        outcome: null,
        workflows: { workflow_id: 'aaaaaaaa-1111-aaaa-1111-aaaaaaaaaaaa' },
      },
      // so we should report the status of this older workflow instead
      // because all of its builds have finished
      {
        outcome: 'failed',
        workflows: { workflow_id: 'bbbbbbbb-1111-aaaa-1111-aaaaaaaaaaaa' },
      },
      {
        outcome: 'success',
        workflows: { workflow_id: 'bbbbbbbb-1111-aaaa-1111-aaaaaaaaaaaa' },
      },
    ]).expect('failed')

    expect(() =>
      summarizeBuildsForLatestCompleteWorkflow([
        // we have no completed workflows
        {
          outcome: null,
          workflows: { workflow_id: 'aaaaaaaa-1111-aaaa-1111-aaaaaaaaaaaa' },
        },
        {
          outcome: null,
          workflows: { workflow_id: 'aaaaaaaa-1111-aaaa-1111-aaaaaaaaaaaa' },
        },
      ])
    ).to.throw(Error, 'No complete workflows found')

    expect(() =>
      summarizeBuildsForLatestCompleteWorkflow([
        // this response doesn't have workflows
        { outcome: 'failed' },
        { outcome: 'success' },
      ])
    ).to.throw(Error, "Cannot read property 'workflow_id' of undefined")
  })
})

describe('circleci: schema validation', function() {
  const validate = function(data, schema) {
    const { error, value } = Joi.validate(data, schema, {
      allowUnknown: true,
      stripUnknown: true,
    })
    return { error, value }
  }

  expect(validate([], circleSchema)).to.deep.equal({ error: null, value: [] })

  expect(
    validate([{ outcome: 'success' }, { outcome: null }], circleSchema)
  ).to.deep.equal({
    error: null,
    value: [{ outcome: 'success' }, { outcome: null }],
  })

  expect(
    validate(
      [
        { outcome: 'success', workflows: { workflow_id: 'aa111' } },
        { outcome: null, workflows: { workflow_id: 'bb222' } },
      ],
      circleSchema
    )
  ).to.deep.equal({
    error: null,
    value: [
      { outcome: 'success', workflows: { workflow_id: 'aa111' } },
      { outcome: null, workflows: { workflow_id: 'bb222' } },
    ],
  })

  // object does not have an 'outcome' key
  expect(validate([{ foo: 'bar' }], circleSchema).error).to.not.equal(null)

  // 'workflows' key doesn't have a workflow_id
  expect(
    validate([{ outcome: 'failed', workflows: { foo: 'bar' } }], circleSchema)
      .error
  ).to.not.equal(null)

  // unexpect value for outcome
  expect(validate([{ foo: 'cheese' }], circleSchema).error).to.not.equal(null)
})
