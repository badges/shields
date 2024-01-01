import dayjs from 'dayjs'
import nock from 'nock'
import { expect } from 'chai'
import { test, given, forCases } from 'sazerac'
import { AuthHelper, clearJwtCache } from './auth-helper.js'
import { InvalidParameter, InvalidResponse } from './errors.js'

function base64UrlEncode(input) {
  const base64 = btoa(JSON.stringify(input))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function getMockJwt(extras) {
  // this function returns a mock JWT that contains enough
  // for a unit test but ignores important aspects e.g: signing

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  }
  const payload = {
    iat: Math.floor(Date.now() / 1000),
    ...extras,
  }

  const encodedHeader = base64UrlEncode(header)
  const encodedPayload = base64UrlEncode(payload)
  return `${encodedHeader}.${encodedPayload}`
}

describe('AuthHelper', function () {
  describe('constructor checks', function () {
    it('throws without userKey or passKey', function () {
      expect(() => new AuthHelper({}, {})).to.throw(
        Error,
        'Expected userKey or passKey to be set',
      )
    })
    it('throws without serviceKey or authorizedOrigins', function () {
      expect(
        () =>
          new AuthHelper({ userKey: 'myci_user', passKey: 'myci_pass' }, {}),
      ).to.throw(Error, 'Expected authorizedOrigins or serviceKey to be set')
    })
    it('throws when authorizedOrigins is not an array', function () {
      expect(
        () =>
          new AuthHelper(
            {
              userKey: 'myci_user',
              passKey: 'myci_pass',
              authorizedOrigins: true,
            },
            { private: {} },
          ),
      ).to.throw(Error, 'Expected authorizedOrigins to be an array of origins')
    })
  })

  describe('isValid', function () {
    function validate(config, privateConfig) {
      return new AuthHelper(
        { authorizedOrigins: ['https://example.test'], ...config },
        { private: privateConfig },
      ).isValid
    }
    test(validate, () => {
      forCases([
        // Fully configured user + pass.
        given(
          { userKey: 'myci_user', passKey: 'myci_pass', isRequired: true },
          { myci_user: 'admin', myci_pass: 'abc123' },
        ),
        given(
          { userKey: 'myci_user', passKey: 'myci_pass' },
          { myci_user: 'admin', myci_pass: 'abc123' },
        ),
        // Fully configured user or pass.
        given(
          { userKey: 'myci_user', isRequired: true },
          { myci_user: 'admin' },
        ),
        given(
          { passKey: 'myci_pass', isRequired: true },
          { myci_pass: 'abc123' },
        ),
        given({ userKey: 'myci_user' }, { myci_user: 'admin' }),
        given({ passKey: 'myci_pass' }, { myci_pass: 'abc123' }),
        // Empty config.
        given({ userKey: 'myci_user', passKey: 'myci_pass' }, {}),
        given({ userKey: 'myci_user' }, {}),
        given({ passKey: 'myci_pass' }, {}),
      ]).expect(true)

      forCases([
        // Partly configured.
        given(
          { userKey: 'myci_user', passKey: 'myci_pass', isRequired: true },
          { myci_user: 'admin' },
        ),
        given(
          { userKey: 'myci_user', passKey: 'myci_pass' },
          { myci_user: 'admin' },
        ),
        // Missing required config.
        given(
          { userKey: 'myci_user', passKey: 'myci_pass', isRequired: true },
          {},
        ),
        given({ userKey: 'myci_user', isRequired: true }, {}),
        given({ passKey: 'myci_pass', isRequired: true }, {}),
      ]).expect(false)
    })
  })

  describe('_basicAuth', function () {
    function validate(config, privateConfig) {
      return new AuthHelper(
        { authorizedOrigins: ['https://example.test'], ...config },
        { private: privateConfig },
      )._basicAuth
    }
    test(validate, () => {
      forCases([
        given(
          { userKey: 'myci_user', passKey: 'myci_pass', isRequired: true },
          { myci_user: 'admin', myci_pass: 'abc123' },
        ),
        given(
          { userKey: 'myci_user', passKey: 'myci_pass' },
          { myci_user: 'admin', myci_pass: 'abc123' },
        ),
      ]).expect({ username: 'admin', password: 'abc123' })
      given({ userKey: 'myci_user' }, { myci_user: 'admin' }).expect({
        username: 'admin',
        password: '',
      })
      given({ passKey: 'myci_pass' }, { myci_pass: 'abc123' }).expect({
        username: '',
        password: 'abc123',
      })
      given({ userKey: 'myci_user', passKey: 'myci_pass' }, {}).expect(
        undefined,
      )
      given(
        { passKey: 'myci_pass', defaultToEmptyStringForUser: true },
        { myci_pass: 'abc123' },
      ).expect({
        username: '',
        password: 'abc123',
      })
    })
  })

  describe('_isInsecureSslRequest', function () {
    test(AuthHelper._isInsecureSslRequest, () => {
      forCases([
        given({ url: 'http://example.test' }),
        given({ url: 'http://example.test', options: {} }),
        given({
          url: 'http://example.test',
          options: { https: { rejectUnauthorized: true } },
        }),
        given({
          url: 'http://example.test',
          options: { https: { rejectUnauthorized: undefined } },
        }),
      ]).expect(false)
      given({
        url: 'http://example.test',
        options: { https: { rejectUnauthorized: false } },
      }).expect(true)
    })
  })

  describe('enforceStrictSsl', function () {
    const authConfig = {
      userKey: 'myci_user',
      passKey: 'myci_pass',
      serviceKey: 'myci',
    }

    context('by default', function () {
      const authHelper = new AuthHelper(authConfig, {
        public: {
          services: { myci: { authorizedOrigins: ['http://myci.test'] } },
        },
        private: { myci_user: 'admin', myci_pass: 'abc123' },
      })
      it('does not throw for secure requests', function () {
        expect(() => authHelper.enforceStrictSsl({})).not.to.throw()
      })
      it('throws for insecure requests', function () {
        expect(() =>
          authHelper.enforceStrictSsl({
            options: { https: { rejectUnauthorized: false } },
          }),
        ).to.throw(InvalidParameter)
      })
    })

    context("when strict SSL isn't required", function () {
      const authHelper = new AuthHelper(authConfig, {
        public: {
          services: {
            myci: {
              authorizedOrigins: ['http://myci.test'],
              requireStrictSsl: false,
            },
          },
        },
        private: { myci_user: 'admin', myci_pass: 'abc123' },
      })
      it('does not throw for secure requests', function () {
        expect(() => authHelper.enforceStrictSsl({})).not.to.throw()
      })
      it('does not throw for insecure requests', function () {
        expect(() =>
          authHelper.enforceStrictSsl({
            options: { https: { rejectUnauthorized: false } },
          }),
        ).not.to.throw()
      })
    })
  })

  describe('shouldAuthenticateRequest', function () {
    const authConfig = {
      userKey: 'myci_user',
      passKey: 'myci_pass',
      serviceKey: 'myci',
    }

    context('by default', function () {
      const authHelper = new AuthHelper(authConfig, {
        public: {
          services: {
            myci: {
              authorizedOrigins: ['https://myci.test'],
            },
          },
        },
        private: { myci_user: 'admin', myci_pass: 'abc123' },
      })
      const shouldAuthenticateRequest = requestOptions =>
        authHelper.shouldAuthenticateRequest(requestOptions)
      describe('a secure request to an authorized origin', function () {
        test(shouldAuthenticateRequest, () => {
          given({ url: 'https://myci.test/api' }).expect(true)
        })
      })
      describe('an insecure request', function () {
        test(shouldAuthenticateRequest, () => {
          given({
            url: 'https://myci.test/api',
            options: { https: { rejectUnauthorized: false } },
          }).expect(false)
        })
      })
      describe('a request to an unauthorized origin', function () {
        test(shouldAuthenticateRequest, () => {
          forCases([
            given({ url: 'http://myci.test/api' }),
            given({ url: 'https://myci.test:12345/api' }),
            given({ url: 'https://other.test/api' }),
          ]).expect(false)
        })
      })
    })

    context('when auth over insecure SSL is allowed', function () {
      const authHelper = new AuthHelper(authConfig, {
        public: {
          services: {
            myci: {
              authorizedOrigins: ['https://myci.test'],
              requireStrictSslToAuthenticate: false,
            },
          },
        },
        private: { myci_user: 'admin', myci_pass: 'abc123' },
      })
      const shouldAuthenticateRequest = requestOptions =>
        authHelper.shouldAuthenticateRequest(requestOptions)
      describe('a secure request to an authorized origin', function () {
        test(shouldAuthenticateRequest, () => {
          given({ url: 'https://myci.test' }).expect(true)
        })
      })
      describe('an insecure request', function () {
        test(shouldAuthenticateRequest, () => {
          given({
            url: 'https://myci.test',
            options: { https: { rejectUnauthorized: false } },
          }).expect(true)
        })
      })
      describe('a request to an unauthorized origin', function () {
        test(shouldAuthenticateRequest, () => {
          forCases([
            given({ url: 'http://myci.test' }),
            given({ url: 'https://myci.test:12345/' }),
            given({ url: 'https://other.test' }),
          ]).expect(false)
        })
      })
    })

    context('when the service is partly configured', function () {
      const authHelper = new AuthHelper(authConfig, {
        public: {
          services: {
            myci: {
              authorizedOrigins: ['https://myci.test'],
              requireStrictSslToAuthenticate: false,
            },
          },
        },
        private: { myci_user: 'admin' },
      })
      const shouldAuthenticateRequest = requestOptions =>
        authHelper.shouldAuthenticateRequest(requestOptions)
      describe('a secure request to an authorized origin', function () {
        test(shouldAuthenticateRequest, () => {
          given({ url: 'https://myci.test' }).expect(false)
        })
      })
    })
  })

  describe('withBasicAuth', function () {
    const authHelper = new AuthHelper(
      {
        userKey: 'myci_user',
        passKey: 'myci_pass',
        serviceKey: 'myci',
      },
      {
        public: {
          services: {
            myci: {
              authorizedOrigins: ['https://myci.test'],
            },
          },
        },
        private: { myci_user: 'admin', myci_pass: 'abc123' },
      },
    )
    const withBasicAuth = requestOptions =>
      authHelper.withBasicAuth(requestOptions)

    describe('authenticates a secure request to an authorized origin', function () {
      test(withBasicAuth, () => {
        given({
          url: 'https://myci.test/api',
        }).expect({
          url: 'https://myci.test/api',
          options: {
            username: 'admin',
            password: 'abc123',
          },
        })
        given({
          url: 'https://myci.test/api',
          options: {
            headers: { Accept: 'application/json' },
          },
        }).expect({
          url: 'https://myci.test/api',
          options: {
            headers: { Accept: 'application/json' },
            username: 'admin',
            password: 'abc123',
          },
        })
      })
    })

    describe('does not authenticate a request to an unauthorized origin', function () {
      test(withBasicAuth, () => {
        given({
          url: 'https://other.test/api',
        }).expect({
          url: 'https://other.test/api',
        })
        given({
          url: 'https://other.test/api',
          options: {
            headers: { Accept: 'application/json' },
          },
        }).expect({
          url: 'https://other.test/api',
          options: {
            headers: { Accept: 'application/json' },
          },
        })
      })
    })

    describe('throws on an insecure SSL request', function () {
      expect(() =>
        withBasicAuth({
          url: 'https://myci.test/api',
          options: { https: { rejectUnauthorized: false } },
        }),
      ).to.throw(InvalidParameter)
    })
  })

  context('JTW Auth', function () {
    describe('_isJwtValid', function () {
      test(AuthHelper._isJwtValid, () => {
        given(dayjs().add(1, 'month').unix()).expect(true)
        given(dayjs().add(2, 'minutes').unix()).expect(true)
        given(dayjs().add(30, 'seconds').unix()).expect(false)
        given(dayjs().unix()).expect(false)
        given(dayjs().subtract(1, 'seconds').unix()).expect(false)
      })
    })

    describe('_getJwtExpiry', function () {
      it('extracts expiry from valid JWT', function () {
        const nowPlus30Mins = dayjs().add(30, 'minutes').unix()
        expect(
          AuthHelper._getJwtExpiry(getMockJwt({ exp: nowPlus30Mins })),
        ).to.equal(nowPlus30Mins)
      })

      it('caps expiry at max', function () {
        const nowPlus1Hour = dayjs().add(1, 'hours').unix()
        const nowPlus2Hours = dayjs().add(2, 'hours').unix()
        expect(
          AuthHelper._getJwtExpiry(getMockJwt({ exp: nowPlus2Hours })),
        ).to.equal(nowPlus1Hour)
      })

      it('throws if JWT does not contain exp', function () {
        expect(() => {
          AuthHelper._getJwtExpiry(getMockJwt({}))
        }).to.throw(InvalidResponse)
      })

      it('throws if JWT is invalid', function () {
        expect(() => {
          AuthHelper._getJwtExpiry('abc')
        }).to.throw(InvalidResponse)
      })
    })

    describe('withJwtAuth', function () {
      const authHelper = new AuthHelper(
        {
          userKey: 'jwt_user',
          passKey: 'jwt_pass',
          authorizedOrigins: ['https://example.com'],
          isRequired: false,
        },
        { private: { jwt_user: 'fred', jwt_pass: 'abc123' } },
      )

      beforeEach(function () {
        clearJwtCache()
      })

      it('should use cached response if valid', async function () {
        // the expiry is far enough in the future that the token
        // will still be valid on the second hit
        const mockToken = getMockJwt({ exp: dayjs().add(1, 'hours').unix() })

        // .times(1) ensures if we try to make a second call to this endpoint,
        // we will throw `Nock: No match for request`
        nock('https://example.com')
          .post('/login')
          .times(1)
          .reply(200, { token: mockToken })
        const params1 = await authHelper.withJwtAuth(
          { url: 'https://example.com/some-endpoint' },
          'https://example.com/login',
        )
        expect(nock.isDone()).to.equal(true)
        expect(params1).to.deep.equal({
          options: {
            headers: {
              Authorization: `Bearer ${mockToken}`,
            },
          },
          url: 'https://example.com/some-endpoint',
        })

        // second time round, we'll get the same response again
        // but this time served from cache
        const params2 = await authHelper.withJwtAuth(
          { url: 'https://example.com/some-endpoint' },
          'https://example.com/login',
        )
        expect(params2).to.deep.equal({
          options: {
            headers: {
              Authorization: `Bearer ${mockToken}`,
            },
          },
          url: 'https://example.com/some-endpoint',
        })

        nock.cleanAll()
      })

      it('should not use cached response if expired', async function () {
        // this time we define a token expiry is close enough
        // that the token will not be valid on the second call
        const mockToken1 = getMockJwt({
          exp: dayjs().add(20, 'seconds').unix(),
        })
        nock('https://example.com')
          .post('/login')
          .times(1)
          .reply(200, { token: mockToken1 })
        const params1 = await authHelper.withJwtAuth(
          { url: 'https://example.com/some-endpoint' },
          'https://example.com/login',
        )
        expect(nock.isDone()).to.equal(true)
        expect(params1).to.deep.equal({
          options: {
            headers: {
              Authorization: `Bearer ${mockToken1}`,
            },
          },
          url: 'https://example.com/some-endpoint',
        })

        // second time round we make another network request
        const mockToken2 = getMockJwt({
          exp: dayjs().add(20, 'seconds').unix(),
        })
        nock('https://example.com')
          .post('/login')
          .times(1)
          .reply(200, { token: mockToken2 })
        const params2 = await authHelper.withJwtAuth(
          { url: 'https://example.com/some-endpoint' },
          'https://example.com/login',
        )
        expect(nock.isDone()).to.equal(true)
        expect(params2).to.deep.equal({
          options: {
            headers: {
              Authorization: `Bearer ${mockToken2}`,
            },
          },
          url: 'https://example.com/some-endpoint',
        })

        nock.cleanAll()
      })
    })
  })
})
