'use strict'

const { test, given } = require('sazerac')
const { expect } = require('chai')
const {
  RedundantCustomConfiguration,
  merge,
  checkCustomIntegrationConfiguration,
} = require('./config')

describe('configuration', function() {
  test(merge, function() {
    given({ a: 2 }, {})
      .describe('copies the default value')
      .expect({ a: 2 })
    given({ a: 2 }, { a: 3 })
      .describe('overrides a primitive value')
      .expect({ a: 3 })
    given({ a: { a1: 1, a2: 2 } }, { a: { a1: 2 } })
      .describe('merges objects')
      .expect({ a: { a1: 2, a2: 2 } })
    given({ a: { a1: 1, a2: 2 } }, { a: 3 })
      .describe('overdrives an object with a primitive')
      .expect({ a: 3 })
    given({ a: { a1: 1, a2: 2 } }, { a: {} })
      .describe('does not override an object with an empty object')
      .expect({ a: { a1: 1, a2: 2 } })
    given({ a: [2, 3, 4] }, { a: [5, 6] })
      .describe('overrides array')
      .expect({ a: [5, 6] })
  })

  describe('checkCustomIntegrationConfiguration function', function() {
    it('accepts the default configuration', function() {
      const config = { public: { integrations: { default: {} } } }
      const serviceClasses = [{ name: 'SomeService' }]

      expect(() =>
        checkCustomIntegrationConfiguration(config, serviceClasses)
      ).not.throw()
    })

    it('accepts a configuration for an existing service', function() {
      const config = { public: { integrations: { SomeService: {} } } }
      const serviceClasses = [{ name: 'SomeService' }]

      expect(() =>
        checkCustomIntegrationConfiguration(config, serviceClasses)
      ).not.throw()
    })

    it('throws an error if a custom config does not have a corresponding service', function() {
      const config = { public: { integrations: { UnknownService: {} } } }
      const serviceClasses = [{ name: 'KnownService' }]

      expect(() =>
        checkCustomIntegrationConfiguration(config, serviceClasses)
      ).to.throw(RedundantCustomConfiguration)
    })
  })
})
