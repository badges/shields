import { expect } from 'chai'
import { NotFound, InvalidResponse, Inaccessible } from './errors.js'
import checkErrorResponse from './check-error-response.js'

describe('async error handler', function () {
  const buffer = Buffer.from('some stuff')

  context('when status is 200', function () {
    it('passes through the inputs', async function () {
      const res = { statusCode: 200 }
      expect(await checkErrorResponse()({ res, buffer })).to.deep.equal({
        res,
        buffer,
      })
    })
  })

  context('when status is 404', function () {
    const buffer = Buffer.from('some stuff')
    const res = { statusCode: 404 }

    it('throws NotFound', async function () {
      try {
        await checkErrorResponse()({ res, buffer })
        expect.fail('Expected to throw')
      } catch (e) {
        expect(e).to.be.an.instanceof(NotFound)
        expect(e.message).to.equal('Not Found')
        expect(e.prettyMessage).to.equal('not found')
        expect(e.response).to.equal(res)
        expect(e.buffer).to.equal(buffer)
      }
    })

    it('displays the custom not found message', async function () {
      const notFoundMessage = 'no goblins found'
      try {
        await checkErrorResponse({ 404: notFoundMessage })({ res, buffer })
        expect.fail('Expected to throw')
      } catch (e) {
        expect(e).to.be.an.instanceof(NotFound)
        expect(e.message).to.equal('Not Found: no goblins found')
        expect(e.prettyMessage).to.equal('no goblins found')
      }
    })
  })

  context('when status is 4xx', function () {
    it('throws InvalidResponse', async function () {
      const res = { statusCode: 499 }
      try {
        await checkErrorResponse()({ res, buffer })
        expect.fail('Expected to throw')
      } catch (e) {
        expect(e).to.be.an.instanceof(InvalidResponse)
        expect(e.message).to.equal(
          'Invalid Response: Got status code 499 (expected 200)'
        )
        expect(e.prettyMessage).to.equal('invalid')
        expect(e.response).to.equal(res)
        expect(e.buffer).to.equal(buffer)
      }
    })

    it('displays the custom error message', async function () {
      const res = { statusCode: 403 }
      try {
        await checkErrorResponse({ 403: 'access denied' })({ res })
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

  context('when status is 5xx', function () {
    it('throws Inaccessible', async function () {
      const res = { statusCode: 503 }
      try {
        await checkErrorResponse()({ res, buffer })
        expect.fail('Expected to throw')
      } catch (e) {
        expect(e).to.be.an.instanceof(Inaccessible)
        expect(e.message).to.equal(
          'Inaccessible: Got status code 503 (expected 200)'
        )
        expect(e.prettyMessage).to.equal('inaccessible')
        expect(e.response).to.equal(res)
        expect(e.buffer).to.equal(buffer)
      }
    })

    it('displays the custom error message', async function () {
      const res = { statusCode: 500 }
      try {
        await checkErrorResponse({ 500: 'server overloaded' })({ res, buffer })
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
