'use strict'

const chai = require('chai')
const { assert, expect } = chai
const { checkErrorResponse } = require('./error-helper')
const {
  NotFound,
  InvalidResponse,
  Inaccessible,
} = require('../services/errors')

chai.use(require('chai-as-promised'))

describe('Standard Error Handler', function() {
  it('makes inaccessible badge', function() {
    const badgeData = { text: [] }
    assert.equal(
      true,
      checkErrorResponse(badgeData, 'something other than null', {})
    )
    assert.equal('inaccessible', badgeData.text[1])
    assert.equal('red', badgeData.colorscheme)
  })

  it('makes not found badge', function() {
    const badgeData = { text: [] }
    assert.equal(true, checkErrorResponse(badgeData, null, { statusCode: 404 }))
    assert.equal('not found', badgeData.text[1])
    assert.equal('lightgrey', badgeData.colorscheme)
  })

  it('makes not found badge with custom error', function() {
    const badgeData = { text: [] }
    assert.equal(
      true,
      checkErrorResponse(badgeData, null, { statusCode: 404 }, 'custom message')
    )
    assert.equal('custom message', badgeData.text[1])
    assert.equal('lightgrey', badgeData.colorscheme)
  })

  it('makes invalid badge', function() {
    const badgeData = { text: [] }
    assert.equal(true, checkErrorResponse(badgeData, null, { statusCode: 500 }))
    assert.equal('invalid', badgeData.text[1])
    assert.equal('lightgrey', badgeData.colorscheme)
  })

  it('return false on 200 status', function() {
    assert.equal(
      false,
      checkErrorResponse({ text: [] }, null, { statusCode: 200 })
    )
  })
})

describe('async error handler', function() {
  context('when status is 200', function() {
    it('passes through the inputs', async function() {
      const args = { buffer: 'buffer', res: { statusCode: 200 } }
      expect(await checkErrorResponse.asPromise()(args)).to.deep.equal(args)
    })
  })

  context('when status is 404', function() {
    const res = { statusCode: 404 }

    it('throws NotFound', async function() {
      try {
        await checkErrorResponse.asPromise()({ res })
        expect.fail('Expected to throw')
      } catch (e) {
        expect(e).to.be.an.instanceof(NotFound)
        expect(e.message).to.equal('Not Found')
        expect(e.prettyMessage).to.equal('not found')
      }
    })

    it('displays the custom not found message', async function() {
      const notFoundMessage = 'no goblins found'
      const res = { statusCode: 404 }
      try {
        await checkErrorResponse.asPromise({ notFoundMessage })({ res })
        expect.fail('Expected to throw')
      } catch (e) {
        expect(e).to.be.an.instanceof(NotFound)
        expect(e.message).to.equal('Not Found: no goblins found')
        expect(e.prettyMessage).to.equal('no goblins found')
      }
    })
  })

  context('when status is 4xx', function() {
    const res = { statusCode: 499 }

    it('throws InvalidResponse', async function() {
      try {
        await checkErrorResponse.asPromise()({ res })
        expect.fail('Expected to throw')
      } catch (e) {
        expect(e).to.be.an.instanceof(InvalidResponse)
        expect(e.message).to.equal(
          'Invalid Response: Got status code 499 (expected 200)'
        )
        expect(e.prettyMessage).to.equal('invalid')
      }
    })
  })

  context('when status is 5xx', function() {
    const res = { statusCode: 503 }

    it('throws Inaccessible', async function() {
      try {
        await checkErrorResponse.asPromise()({ res })
        expect.fail('Expected to throw')
      } catch (e) {
        expect(e).to.be.an.instanceof(Inaccessible)
        expect(e.message).to.equal(
          'Inaccessible: Got status code 503 (expected 200)'
        )
        expect(e.prettyMessage).to.equal('inaccessible')
      }
    })
  })
})
