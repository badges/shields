import { expect } from 'chai'
import sinon from 'sinon'
import times from 'lodash.times'
import { Token, TokenPool } from './token-pool.js'

function expectPoolToBeExhausted(pool) {
  expect(() => {
    pool.next()
  }).to.throw(Error, /^Token pool is exhausted$/)
}

describe('The token pool', function () {
  const ids = ['1', '2', '3', '4', '5']
  const batchSize = 3

  let tokenPool
  beforeEach(function () {
    tokenPool = new TokenPool({ batchSize })
    ids.forEach(id => tokenPool.add(id))
  })

  it('should yield the expected tokens', function () {
    ids.forEach(id =>
      times(batchSize, () => expect(tokenPool.next().id).to.equal(id))
    )
  })

  it('should repeat when reaching the end', function () {
    ids.forEach(id =>
      times(batchSize, () => expect(tokenPool.next().id).to.equal(id))
    )
    ids.forEach(id =>
      times(batchSize, () => expect(tokenPool.next().id).to.equal(id))
    )
  })

  context('tokens are marked exhausted immediately', function () {
    it('should be exhausted', function () {
      ids.forEach(() => {
        const token = tokenPool.next()
        token.update(0, Token.nextResetNever)
      })

      expectPoolToBeExhausted(tokenPool)
    })
  })

  context('tokens are marked after the last request', function () {
    it('should be exhausted', function () {
      ids.forEach(() => {
        const token = times(batchSize, () => tokenPool.next()).pop()
        token.update(0, Token.nextResetNever)
      })

      expectPoolToBeExhausted(tokenPool)
    })
  })

  context('tokens are renewed', function () {
    it('should keep using them', function () {
      const tokensToRenew = ['2', '4']
      const renewalCount = 3

      ids.forEach(id => {
        const token = times(batchSize, () => tokenPool.next()).pop()
        const usesRemaining = tokensToRenew.includes(token.id)
          ? renewalCount
          : 0
        token.update(usesRemaining, Token.nextResetNever)
      })

      tokensToRenew.forEach(id => {
        let token
        times(renewalCount, () => {
          token = tokenPool.next()
          expect(token.id).to.equal(id)
        }).pop()
        token.update(0, Token.nextResetNever)
      })

      expectPoolToBeExhausted(tokenPool)
    })
  })

  context('tokens reset', function () {
    let clock
    beforeEach(function () {
      clock = sinon.useFakeTimers()
    })
    afterEach(function () {
      clock.restore()
    })

    it('should start using them', function () {
      const tokensToReset = ['2', '4']
      const futureTime = 1440

      ids.forEach(id => {
        const token = times(batchSize, () => tokenPool.next()).pop()
        const nextReset = tokensToReset.includes(token.id)
          ? futureTime
          : Token.nextResetNever
        token.update(0, nextReset)
      })

      expectPoolToBeExhausted(tokenPool)

      clock.tick(1000 * futureTime)

      tokensToReset.forEach(id => {
        const token = times(batchSize, () => tokenPool.next()).pop()
        token.update(0, Token.nextResetNever)
      })

      expectPoolToBeExhausted(tokenPool)
    })
  })

  context('when empty', function () {
    it('next() should return the expected error', function () {
      const tokenPool = new TokenPool()
      expect(() => tokenPool.next()).to.throw('Token pool is exhausted')
    })
  })
})
