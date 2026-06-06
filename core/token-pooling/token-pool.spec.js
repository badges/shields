import { expect } from 'chai'
import sinon from 'sinon'
import { Token, TokenPool } from './token-pool.js'

const times = (n, fn) => [...Array(n)].map(() => fn())

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
      times(batchSize, () => expect(tokenPool.next().id).to.equal(id)),
    )
  })

  it('should repeat when reaching the end', function () {
    ids.forEach(id =>
      times(batchSize, () => expect(tokenPool.next().id).to.equal(id)),
    )
    ids.forEach(id =>
      times(batchSize, () => expect(tokenPool.next().id).to.equal(id)),
    )
  })

  it('updates data when an existing token is added again', function () {
    const tokenPool = new TokenPool()

    expect(tokenPool.add('token', { scopes: [] })).to.equal(true)
    expect(tokenPool.add('token', { scopes: ['read:packages'] })).to.equal(
      false,
    )

    expect(tokenPool.next().data).to.deep.equal({
      scopes: ['read:packages'],
    })
  })

  it('preserves existing data when an existing token is added again without data', function () {
    const tokenPool = new TokenPool()

    expect(tokenPool.add('token', { scopes: ['read:packages'] })).to.equal(true)
    expect(tokenPool.add('token')).to.equal(false)

    expect(tokenPool.next().data).to.deep.equal({
      scopes: ['read:packages'],
    })
  })

  it('revalidates invalid tokens when they are added again', function () {
    const tokenPool = new TokenPool()
    expect(tokenPool.add('token', { scopes: [] })).to.equal(true)

    tokenPool.next().invalidate()
    expectPoolToBeExhausted(tokenPool)

    expect(tokenPool.add('token', { scopes: ['read:packages'] })).to.equal(
      false,
    )

    const token = tokenPool.next()
    expect(token.id).to.equal('token')
    expect(token.data).to.deep.equal({ scopes: ['read:packages'] })
  })

  it('does not duplicate queued tokens when they are revalidated', function () {
    const tokenPool = new TokenPool({ batchSize: 2 })
    tokenPool.add('first')
    tokenPool.add('second')

    tokenPool.next().invalidate()
    tokenPool.add('first')

    expect(tokenPool.next().id).to.equal('first')
    expect(tokenPool.next().id).to.equal('second')
    expect(tokenPool.next().id).to.equal('second')
    expect(tokenPool.next().id).to.equal('first')
  })

  it('does not duplicate exhausted tokens when they are revalidated', function () {
    const tokenPool = new TokenPool()
    tokenPool.add('first')
    tokenPool.add('second')

    const first = tokenPool.next()
    first.update(0, Token.nextResetNever)
    tokenPool.next()

    first.invalidate()
    tokenPool.add('first')

    const { allTokenDebugInfo } = tokenPool.serializeDebugInfo({
      sanitize: false,
    })
    const tokenIds = allTokenDebugInfo.map(({ id }) => id)

    expect(tokenIds).to.have.members(['first', 'second'])
    expect(
      allTokenDebugInfo.find(({ id }) => id === 'first').isFrozen,
    ).to.equal(false)
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

  context('serializeDebugInfo()', function () {
    let clock
    beforeEach(function () {
      clock = sinon.useFakeTimers({ now: 1544307744484 })
    })
    afterEach(function () {
      clock.restore()
    })

    it('should return sanitized debug info', function () {
      const debugInfo = tokenPool.serializeDebugInfo()

      expect(debugInfo.utcEpochSeconds).to.equal(1544307744)
      expect(debugInfo.totalUsesRemaining).to.equal(ids.length * batchSize)
      expect(debugInfo.allTokenDebugInfo).to.have.lengthOf(ids.length)
      expect(debugInfo.sanitized).to.equal(true)
      debugInfo.allTokenDebugInfo.forEach(tokenInfo => {
        expect(tokenInfo.id).to.be.a('string')
        expect(tokenInfo.id).to.have.lengthOf(64) // SHA-256 hex is 64 chars
        expect(tokenInfo.data).to.equal('[redacted]')
        expect(tokenInfo.usesRemaining).to.equal(batchSize)
        expect(tokenInfo.nextReset).to.equal(Token.nextResetNever)
        expect(tokenInfo.isValid).to.equal(true)
        expect(tokenInfo.isFrozen).to.equal(false)
      })
    })

    it('should return unsanitized debug info', function () {
      const debugInfo = tokenPool.serializeDebugInfo({ sanitize: false })

      expect(debugInfo.sanitized).to.equal(false)
      debugInfo.allTokenDebugInfo.forEach((tokenInfo, index) => {
        expect(tokenInfo.id).to.equal(ids[index])
      })
    })

    it('should exclude invalidated tokens', function () {
      const token = tokenPool.next()
      token.invalidate()

      const debugInfo = tokenPool.serializeDebugInfo()

      expect(debugInfo.allTokenDebugInfo).to.have.lengthOf(ids.length - 1)
      expect(debugInfo.totalUsesRemaining).to.equal(
        (ids.length - 1) * batchSize,
      )
    })
  })
})
