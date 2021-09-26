import Joi from 'joi'
import { expect } from 'chai'
import sinon from 'sinon'
import trace from './trace.js'
import { InvalidParameter } from './errors.js'
import validate from './validate.js'

describe('validate', function () {
  const schema = Joi.object({
    requiredString: Joi.string().required(),
  }).required()

  beforeEach(function () {
    sinon.stub(trace, 'logTrace')
  })
  afterEach(function () {
    sinon.restore()
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

  context('schema is not provided', function () {
    it('throws the expected programmer error', function () {
      try {
        validate(options, { requiredString: 'bar' }, undefined)
        expect.fail('Expected to throw')
      } catch (e) {
        expect(e).to.be.an.instanceof(Error)
        expect(e.message).to.equal('A Joi schema is required')
      }
    })
  })

  context('data matches schema', function () {
    it('logs the data', function () {
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

  context('data does not match schema', function () {
    it('logs the data and throws the expected error', function () {
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
          'Invalid Parameter: "requiredString" must be a string'
        )
        expect(e.prettyMessage).to.equal(prettyErrorMessage)
      }
      expect(trace.logTrace).to.be.calledWithMatch(
        'validate',
        sinon.match.string,
        traceErrorMessage,
        '"requiredString" must be a string'
      )
    })

    context('with includeKeys: true', function () {
      it('includes keys in the error text', function () {
        try {
          validate(
            { ...options, includeKeys: true },
            {
              requiredString: ['this', "shouldn't", 'work'],
            },
            schema
          )
          expect.fail('Expected to throw')
        } catch (e) {
          expect(e).to.be.an.instanceof(InvalidParameter)
          expect(e.message).to.equal(
            'Invalid Parameter: "requiredString" must be a string'
          )
          expect(e.prettyMessage).to.equal(
            `${prettyErrorMessage}: requiredString`
          )
        }
      })
    })
  })

  it('allowAndStripUnknownKeys', function () {
    try {
      validate(
        { ...options, allowAndStripUnknownKeys: false, includeKeys: true },
        { requiredString: 'bar', extra: 'nonsense', more: 'bogus' },
        schema
      )
      expect.fail('Expected to throw')
    } catch (e) {
      expect(e).to.be.an.instanceof(InvalidParameter)
      expect(e.message).to.equal(
        'Invalid Parameter: "extra" is not allowed. "more" is not allowed'
      )
      expect(e.prettyMessage).to.equal(`${prettyErrorMessage}: extra, more`)
    }
  })
})
