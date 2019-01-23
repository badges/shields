'use strict'

const { expect } = require('chai')
const {
  NotFound,
  InvalidResponse,
  Inaccessible,
} = require('../core/base-service/errors')
const { checkErrorResponse } = require('./error-helper')

describe('Standard Error Handler', function() {
  it('makes inaccessible badge', function() {
    const badgeData = { text: [] }
    expect(checkErrorResponse(badgeData, 'something other than null', {})).to.be
      .true
    expect(badgeData.text[1]).to.equal('inaccessible')
    expect(badgeData.colorscheme).to.equal('red')
  })

  it('makes not found badge', function() {
    const badgeData = { text: [] }
    expect(checkErrorResponse(badgeData, null, { statusCode: 404 })).to.be.true
    expect(badgeData.text[1]).to.equal('not found')
    expect(badgeData.colorscheme).to.equal('lightgrey')
  })

  it('makes not found badge with custom error', function() {
    const badgeData = { text: [] }
    expect(
      checkErrorResponse(
        badgeData,
        null,
        { statusCode: 404 },
        { 404: 'custom message' }
      )
    ).to.be.true
    expect(badgeData.text[1]).to.equal('custom message')
    expect(badgeData.colorscheme).to.equal('lightgrey')
  })

  it('makes invalid badge', function() {
    const badgeData = { text: [] }
    expect(checkErrorResponse(badgeData, null, { statusCode: 500 })).to.be.true
    expect(badgeData.text[1]).to.equal('invalid')
    expect(badgeData.colorscheme).to.equal('lightgrey')
  })

  it('return false on 200 status', function() {
    expect(checkErrorResponse({ text: [] }, null, { statusCode: 200 })).to.be
      .false
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
      try {
        await checkErrorResponse.asPromise({ 404: notFoundMessage })({ res })
        expect.fail('Expected to throw')
      } catch (e) {
        expect(e).to.be.an.instanceof(NotFound)
        expect(e.message).to.equal('Not Found: no goblins found')
        expect(e.prettyMessage).to.equal('no goblins found')
      }
    })
  })

  context('when status is 4xx', function() {
    it('throws InvalidResponse', async function() {
      const res = { statusCode: 499 }
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

    it('displays the custom error message', async function() {
      const res = { statusCode: 403 }
      try {
        await checkErrorResponse.asPromise({
          403: 'access denied',
        })({ res })
        expect.fail('Expected to throw')
      } catch (e) {
        expect(e).to.be.an.instanceof(InvalidResponse)
        expect(e.message).to.equal(
          'Invalid Response: Got status code 403 (expected 200)'
        )
        expect(e.prettyMessage).to.equal('access denied')
      }
    })
  })

  context('when status is 5xx', function() {
    it('throws Inaccessible', async function() {
      const res = { statusCode: 503 }
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

    it('displays the custom error message', async function() {
      const res = { statusCode: 500 }
      try {
        await checkErrorResponse.asPromise({
          500: 'server overloaded',
        })({ res })
        expect.fail('Expected to throw')
      } catch (e) {
        expect(e).to.be.an.instanceof(Inaccessible)
        expect(e.message).to.equal(
          'Inaccessible: Got status code 500 (expected 200)'
        )
        expect(e.prettyMessage).to.equal('server overloaded')
      }
    })
  })
})
