import { expect } from 'chai'
import { test, given, forCases } from 'sazerac'
import { AuthHelper } from './auth-helper.js'
import { InvalidParameter } from './errors.js'

describe('AuthHelper', function () {
  describe('constructor checks', function () {
    it('throws without userKey or passKey', function () {
      expect(() => new AuthHelper({}, {})).to.throw(
        Error,
        'Expected userKey or passKey to be set'
      )
    })
    it('throws without serviceKey or authorizedOrigins', function () {
      expect(
        () => new AuthHelper({ userKey: 'myci_user', passKey: 'myci_pass' }, {})
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
            { private: {} }
          )
      ).to.throw(Error, 'Expected authorizedOrigins to be an array of origins')
    })
  })

  describe('isValid', function () {
    function validate(config, privateConfig) {
      return new AuthHelper(
        { authorizedOrigins: ['https://example.test'], ...config },
        { private: privateConfig }
      ).isValid
    }
    test(validate, () => {
      forCases([
        // Fully configured user + pass.
        given(
          { userKey: 'myci_user', passKey: 'myci_pass', isRequired: true },
          { myci_user: 'admin', myci_pass: 'abc123' }
        ),
        given(
          { userKey: 'myci_user', passKey: 'myci_pass' },
          { myci_user: 'admin', myci_pass: 'abc123' }
        ),
        // Fully configured user or pass.
        given(
          { userKey: 'myci_user', isRequired: true },
          { myci_user: 'admin' }
        ),
        given(
          { passKey: 'myci_pass', isRequired: true },
          { myci_pass: 'abc123' }
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
          { myci_user: 'admin' }
        ),
        given(
          { userKey: 'myci_user', passKey: 'myci_pass' },
          { myci_user: 'admin' }
        ),
        // Missing required config.
        given(
          { userKey: 'myci_user', passKey: 'myci_pass', isRequired: true },
          {}
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
        { private: privateConfig }
      )._basicAuth
    }
    test(validate, () => {
      forCases([
        given(
          { userKey: 'myci_user', passKey: 'myci_pass', isRequired: true },
          { myci_user: 'admin', myci_pass: 'abc123' }
        ),
        given(
          { userKey: 'myci_user', passKey: 'myci_pass' },
          { myci_user: 'admin', myci_pass: 'abc123' }
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
        undefined
      )
      given(
        { passKey: 'myci_pass', defaultToEmptyStringForUser: true },
        { myci_pass: 'abc123' }
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
          })
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
          })
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
      }
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
        })
      ).to.throw(InvalidParameter)
    })
  })
})
