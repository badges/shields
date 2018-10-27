'use strict'
const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const Raven = require('raven')

chai.use(sinonChai)

function requireUncached(module) {
  delete require.cache[require.resolve(module)]
  return require(module)
}

describe('log', function() {
  describe('error', function() {
    before(function() {
      this.clock = sinon.useFakeTimers()
      sinon.stub(Raven, 'captureException').callsFake((e, callback) => {
        callback(new Error(`Cannot send message "${e}" to Sentry.`))
      })
      // we have to create a spy before requiring 'error' function
      sinon.spy(console, 'error')
      this.error = requireUncached('./log').error
    })

    after(function() {
      this.clock.restore()
      console.error.restore()
      Raven.captureException.restore()
    })

    it('should throttle errors from Raven client', function() {
      this.error('test error 1')
      this.error('test error 2')
      this.error('test error 3')
      this.clock.tick(11000)
      this.error('test error 4')
      this.error('test error 5')

      expect(console.error).to.be.calledWithExactly(
        'Failed to send captured exception to Sentry',
        'Cannot send message "test error 1" to Sentry.'
      )
      expect(console.error).to.not.be.calledWithExactly(
        'Failed to send captured exception to Sentry',
        'Cannot send message "test error 2" to Sentry.'
      )
      expect(console.error).to.not.be.calledWithExactly(
        'Failed to send captured exception to Sentry',
        'Cannot send message "test error 3" to Sentry.'
      )
      expect(console.error).to.be.calledWithExactly(
        'Failed to send captured exception to Sentry',
        'Cannot send message "test error 4" to Sentry.'
      )
      expect(console.error).to.not.be.calledWithExactly(
        'Failed to send captured exception to Sentry',
        'Cannot send message "test error 5" to Sentry.'
      )
    })
  })
})
