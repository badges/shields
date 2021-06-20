import { checkNames, collectDefinitions } from '../core/base-service/loader.js'

// When these tests fail, they will throw AssertionErrors. Wrapping them in an
// `expect().not.to.throw()` makes the error output unreadable.

it('Services have unique names', async function () {
  this.timeout(30000)
  await checkNames()
})

it('Can collect the service definitions', async function () {
  await collectDefinitions()
})
