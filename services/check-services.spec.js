'use strict'

const { collectDefinitions } = require('../core/base-service/loader')

it('Can collect the service definitions', function() {
  // When this fails, it will throw AssertionErrors. Wrapping this in an
  // `expect().not.to.throw()` makes the error output unreadable.
  collectDefinitions()
})
