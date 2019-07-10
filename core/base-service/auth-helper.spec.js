'use strict'

const { expect } = require('chai')
const { test, given, forCases } = require('sazerac')
const { AuthHelper } = require('./auth-helper')

describe('AuthHelper', function() {
  it('throws without userKey or passKey', function() {
    expect(() => new AuthHelper({}, {})).to.throw(
      Error,
      'Expected userKey or passKey to be set'
    )
  })

  describe('isValid', function() {
    function validate(config, privateConfig) {
      return new AuthHelper(config, privateConfig).isValid
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

  describe('basicAuth', function() {
    function validate(config, privateConfig) {
      return new AuthHelper(config, privateConfig).basicAuth
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
      ]).expect({ user: 'admin', pass: 'abc123' })
      given({ userKey: 'myci_user' }, { myci_user: 'admin' }).expect({
        user: 'admin',
        pass: undefined,
      })
      given({ passKey: 'myci_pass' }, { myci_pass: 'abc123' }).expect({
        user: undefined,
        pass: 'abc123',
      })
      given({ userKey: 'myci_user', passKey: 'myci_pass' }, {}).expect(
        undefined
      )
    })
  })
})
