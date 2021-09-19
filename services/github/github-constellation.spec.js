import { expect } from 'chai'
import sinon from 'sinon'
import log from '../../core/server/log.js'
import RedisTokenPersistence from '../../core/token-pooling/redis-token-persistence.js'
import GithubConstellation from './github-constellation.js'
import GithubApiProvider from './github-api-provider.js'

describe('GithubConstellation', function () {
  const tokens = [
    'abc123',
    'def4567.scopes.read:packages%20read:user',
    'def789.scopes.read:packages',
    'ghi012',
    'fff444.scopes.read:packages',
    '555eee.scopes.read:packages',
    'ddd666',
    '777ccc',
    'bbb888',
    '999aaa',
    '000111.scopes.read:packages',
    '222333.scopes.read:packages',
    '111111',
    '888888',
  ]
  const config = {
    private: {
      redis_url: 'localhost',
    },
    service: {
      debug: {
        enabled: false,
      },
    },
  }
  const server = { ajax: { on: sinon.stub() } }

  beforeEach(function () {
    sinon.stub(log, 'log')
    sinon
      .stub(GithubConstellation, '_createOauthHelper')
      .returns({ isConfigured: false })
    sinon.stub(GithubConstellation.prototype, 'scheduleDebugLogging')
    sinon.stub(RedisTokenPersistence.prototype, 'initialize').returns(tokens)
    sinon.stub(RedisTokenPersistence.prototype, 'noteTokenAdded')
    sinon.stub(RedisTokenPersistence.prototype, 'noteTokenRemoved')
    sinon.spy(GithubApiProvider.prototype, 'addToken')
    sinon.spy(GithubApiProvider.prototype, 'addReservedScopedToken')
  })

  afterEach(function () {
    sinon.restore()
  })

  context('initialize', function () {
    it('does not fetch tokens when pooling disabled', async function () {
      const constellation = new GithubConstellation({
        ...config,
        ...{ private: { gh_token: 'secret' } },
      })
      await constellation.initialize(server)
      expect(RedisTokenPersistence.prototype.initialize).not.to.have.been.called
    })

    it('loads both scoped and unscoped tokens', async function () {
      const constellation = new GithubConstellation(config)
      await constellation.initialize(server)
      expect(constellation.apiProvider.graphqlTokens.count()).to.equal(12)
      expect(constellation.apiProvider.searchTokens.count()).to.equal(12)
      expect(constellation.apiProvider.standardTokens.count()).to.equal(12)
      expect(constellation.apiProvider.packageScopedTokens.count()).to.equal(2)
      expect(
        GithubApiProvider.prototype.addReservedScopedToken
      ).to.be.calledWithExactly('def4567', {
        scopes: 'read:packages%20read:user',
      })
      expect(
        GithubApiProvider.prototype.addReservedScopedToken
      ).to.be.calledWithExactly('def789', {
        scopes: 'read:packages',
      })
    })
  })

  context('onTokenAdded', function () {
    it('adds new scoped token with met reserves', async function () {
      const token = 'shh_secret'
      sinon
        .stub(GithubApiProvider.prototype, 'numReservedScopedTokens')
        .returns(2)
      const clock = sinon.useFakeTimers()
      const constellation = new GithubConstellation(config)
      await constellation.initialize(server)
      constellation._maxNumReservedScopedTokens = 2
      constellation.onTokenAdded(token, 'read:packages')
      await clock.tickAsync()
      expect(GithubApiProvider.prototype.addToken).to.be.calledWithExactly(
        token,
        { scopes: 'read:packages' }
      )
      expect(
        GithubApiProvider.prototype.addReservedScopedToken
      ).to.not.be.calledWith(token)
      expect(RedisTokenPersistence.prototype.noteTokenAdded).to.be.calledWith(
        `${token}.scopes.read:packages`
      )
      expect(RedisTokenPersistence.prototype.noteTokenRemoved).to.not.be.called
      expect(Object.keys(constellation._tokenScopes).length).to.equal(15)
      expect(constellation._tokenScopes[token]).to.equal('read:packages')
    })

    it('adds new scoped token with unmet reserves', async function () {
      const token = 'shh_secret'
      sinon
        .stub(GithubApiProvider.prototype, 'numReservedScopedTokens')
        .returns(2)
      const clock = sinon.useFakeTimers()
      const constellation = new GithubConstellation(config)
      await constellation.initialize(server)
      constellation._maxNumReservedScopedTokens = 3
      constellation.onTokenAdded(token, 'read:packages')
      await clock.tickAsync()
      expect(
        GithubApiProvider.prototype.addReservedScopedToken
      ).to.be.calledWithExactly(token, { scopes: 'read:packages' })
      expect(GithubApiProvider.prototype.addToken).to.not.be.calledWith(token)
      expect(RedisTokenPersistence.prototype.noteTokenAdded).to.be.calledWith(
        `${token}.scopes.read:packages`
      )
      expect(RedisTokenPersistence.prototype.noteTokenRemoved).to.not.be.called
      expect(Object.keys(constellation._tokenScopes).length).to.equal(15)
      expect(constellation._tokenScopes[token]).to.equal('read:packages')
    })

    it('adds new unscoped token', async function () {
      const token = '1234567890987654321'
      const clock = sinon.useFakeTimers()
      const constellation = new GithubConstellation(config)
      await constellation.initialize(server)
      constellation.onTokenAdded(token)
      await clock.tickAsync()
      expect(GithubApiProvider.prototype.addToken).to.be.calledWithExactly(
        token,
        { scopes: undefined }
      )
      expect(
        GithubApiProvider.prototype.addReservedScopedToken
      ).to.not.be.calledWith(token)
      expect(RedisTokenPersistence.prototype.noteTokenAdded).to.be.calledWith(
        token
      )
      expect(RedisTokenPersistence.prototype.noteTokenRemoved).to.not.be.called
      expect(Object.keys(constellation._tokenScopes).length).to.equal(15)
      expect(constellation._tokenScopes[token]).to.equal(null)
    })

    it('updates scopes on existing token', async function () {
      const existingToken = 'abc123'
      const clock = sinon.useFakeTimers()
      const constellation = new GithubConstellation(config)
      await constellation.initialize(server)
      sinon
        .stub(GithubApiProvider.prototype, 'numReservedScopedTokens')
        .returns(1)
      constellation.onTokenAdded(existingToken, 'read:packages')
      await clock.tickAsync()
      expect(
        GithubApiProvider.prototype.addReservedScopedToken
      ).to.be.calledWithExactly(existingToken, { scopes: 'read:packages' })
      expect(GithubApiProvider.prototype.addToken.callCount).to.equal(12)
      expect(RedisTokenPersistence.prototype.noteTokenAdded).to.be.calledWith(
        `${existingToken}.scopes.read:packages`
      )
      expect(RedisTokenPersistence.prototype.noteTokenRemoved).to.be.calledWith(
        existingToken
      )
      expect(Object.keys(constellation._tokenScopes).length).to.equal(14)
      expect(constellation._tokenScopes[existingToken]).to.equal(
        'read:packages'
      )
    })
  })

  context('onTokenInvalidated', function () {
    it('removes scoped token', async function () {
      const clock = sinon.useFakeTimers()
      const constellation = new GithubConstellation(config)
      await constellation.initialize(server)
      constellation.onTokenInvalidated('def789')
      await clock.tickAsync()
      expect(RedisTokenPersistence.prototype.noteTokenRemoved).to.be.calledWith(
        'def789.scopes.read:packages'
      )
      expect(Object.keys(constellation._tokenScopes).length).to.equal(13)
    })

    it('removes unscoped token', async function () {
      const clock = sinon.useFakeTimers()
      const constellation = new GithubConstellation(config)
      await constellation.initialize(server)
      constellation.onTokenInvalidated('888888')
      await clock.tickAsync()
      expect(
        RedisTokenPersistence.prototype.noteTokenRemoved
      ).to.be.calledWithExactly('888888')
      expect(Object.keys(constellation._tokenScopes).length).to.equal(13)
    })
  })
})
