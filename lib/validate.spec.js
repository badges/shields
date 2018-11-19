'use strict'

const Joi = require('joi')
const { expect } = require('chai')
const sinon = require('sinon')
const trace = require('../services/trace')
const { InvalidParameter } = require('../services/errors')
const validate = require('./validate')

describe('validate', function() {
  const schema = Joi.object({
    requiredString: Joi.string().required(),
  }).required()

  let sandbox
  beforeEach(function() {
    sandbox = sinon.createSandbox()
  })
  afterEach(function() {
    sandbox.restore()
  })
  beforeEach(function() {
    sandbox.stub(trace, 'logTrace')
  })

  const ErrorClass = InvalidParameter
  const prettyErrorMessage = 'parameter does not match schema'
  const traceErrorMessage = 'Params did not match schema'
  const traceSuccessMessage = 'Params after validation'

  const options = {
    ErrorClass,
    prettyErrorMessage,
    traceErrorMessage,
    traceSuccessMessage,
  }

  context('schema is not provided', function() {
    it('throws the expected programmer error', function() {
      try {
        validate(options, { requiredString: 'bar' }, undefined)
        expect.fail('Expected to throw')
      } catch (e) {
        expect(e).to.be.an.instanceof(Error)
        expect(e.message).to.equal('A Joi schema is required')
      }
    })
  })

  context('data matches schema', function() {
    it('logs the data', function() {
      validate(options, { requiredString: 'bar' }, schema)
      expect(trace.logTrace).to.be.calledWithMatch(
        'validate',
        sinon.match.string,
        traceSuccessMessage,
        { requiredString: 'bar' },
        { deep: true }
      )
    })
  })

  context('data does not match schema', function() {
    it('logs the data and throws the expected error', async function() {
      try {
        validate(
          options,
          { requiredString: ['this', "shouldn't", 'work'] },
          schema
        )
        expect.fail('Expected to throw')
      } catch (e) {
        expect(e).to.be.an.instanceof(InvalidParameter)
        expect(e.message).to.equal(
          'Invalid Parameter: child "requiredString" fails because ["requiredString" must be a string]'
        )
        expect(e.prettyMessage).to.equal(prettyErrorMessage)
      }
      expect(trace.logTrace).to.be.calledWithMatch(
        'validate',
        sinon.match.string,
        traceErrorMessage,
        'child "requiredString" fails because ["requiredString" must be a string]'
      )
    })
  })
})
