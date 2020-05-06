'use strict'

const {
  checkNames,
  collectDefinitions,
} = require('../core/base-service/loader')

// When these tests fail, they will throw AssertionErrors. Wrapping them in an
// `expect().not.to.throw()` makes the error output unreadable.

it('Services have unique names', function () {
  this.timeout(30000)
  checkNames()
})

it('Can collect the service definitions', function () {
  collectDefinitions()
})
