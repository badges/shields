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

  it('allValidTokenIds() should return the full list', function () {
    expect(tokenPool.allValidTokenIds()).to.deep.equal(ids)
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

  describe('serializeDebugInfo should initially return the expected', function () {
    beforeEach(function () {
      sinon.useFakeTimers({ now: 1544307744484 })
    })

    afterEach(function () {
      sinon.restore()
    })

    context('sanitize is not specified', function () {
      it('returns fully sanitized results', function () {
        // This is `sha()` of '1', '2', '3', '4', '5'. These are written
        // literally for avoidance of doubt as to whether sanitization is
        // happening.
        const sanitizedIds = [
          '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
          'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35',
          '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce',
          '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
          'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
        ]

        expect(tokenPool.serializeDebugInfo()).to.deep.equal({
          allValidTokenIds: sanitizedIds,
          priorityQueue: [],
          fifoQueue: sanitizedIds.map(id => ({
            data: '[redacted]',
            id,
            isFrozen: false,
            isValid: true,
            nextReset: Token.nextResetNever,
            usesRemaining: batchSize,
          })),
          sanitized: true,
          utcEpochSeconds: 1544307744,
        })
      })
    })

    context('with sanitize: false', function () {
      it('returns unsanitized results', function () {
        expect(tokenPool.serializeDebugInfo({ sanitize: false })).to.deep.equal(
          {
            allValidTokenIds: ids,
            priorityQueue: [],
            fifoQueue: ids.map(id => ({
              data: undefined,
              id,
              isFrozen: false,
              isValid: true,
              nextReset: Token.nextResetNever,
              usesRemaining: batchSize,
            })),
            sanitized: false,
            utcEpochSeconds: 1544307744,
          }
        )
      })
    })
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
