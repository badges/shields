import { expect } from 'chai'
import nock from 'nock'
import config from 'config'
import { fetch } from '../core/base-service/got.js'
import BaseService from '../core/base-service/base.js'
const runnerConfig = config.util.toObject()

function cleanUpNockAfterEach() {
  afterEach(function () {
    nock.restore()
    nock.cleanAll()
    nock.enableNetConnect()
    nock.activate()
  })
}

function noToken(serviceClass) {
  let hasLogged = false
  return () => {
    const userKey = serviceClass.auth.userKey
    const passKey = serviceClass.auth.passKey
    const noToken =
      (userKey && !runnerConfig.private[userKey]) ||
      (passKey && !runnerConfig.private[passKey])
    if (noToken && !hasLogged) {
      console.warn(
        `${serviceClass.name}: no credentials configured, tests for this service will be skipped. Add credentials in local.yml to run them.`,
      )
      hasLogged = true
    }
    return noToken
  }
}

/**
 * Retrieves an example set of parameters for invoking a service class using OpenAPI example of that class.
 *
 * @param {BaseService} serviceClass The service class containing OpenAPI specifications.
 * @returns {object} An object with call params to use with a service invoke of the first OpenAPI example.
 * @throws {TypeError} - Throws a TypeError if the input `serviceClass` is not an instance of BaseService,
 *   or if it lacks the expected structure.
 *
 * @example
 * // Example usage:
 * const example = getBadgeExampleCall(StackExchangeReputation)
 * console.log(example)
 * // Output: { stackexchangesite: 'stackoverflow', query: '123' }
 * StackExchangeReputation.invoke(defaultContext, config, example)
 */
function getBadgeExampleCall(serviceClass) {
  if (!(serviceClass.prototype instanceof BaseService)) {
    throw new TypeError(
      'Invalid serviceClass: Must be an instance of BaseService.',
    )
  }

  if (!serviceClass.openApi) {
    throw new TypeError(
      `Missing OpenAPI in service class ${serviceClass.name}.`,
    )
  }

  const firstOpenapiPath = Object.keys(serviceClass.openApi)[0]

  const firstOpenapiExampleParams =
    serviceClass.openApi[firstOpenapiPath].get.parameters
  if (!Array.isArray(firstOpenapiExampleParams)) {
    throw new TypeError(
      `Missing or invalid OpenAPI examples in ${serviceClass.name}.`,
    )
  }

  // reformat structure for serviceClass.invoke
  const exampleInvokeParams = firstOpenapiExampleParams.reduce((acc, obj) => {
    acc[obj.name] = obj.example
    return acc
  }, {})

  return exampleInvokeParams
}

/**
 * Test authentication of a badge for it's first OpenAPI example using a provided dummyResponse
 *
 * @param {BaseService} serviceClass The service class tested.
 * @param {object} dummyResponse An object containing the dummy response by the server.
 * @throws {TypeError} - Throws a TypeError if the input `serviceClass` is not an instance of BaseService,
 *   or if `serviceClass` is missing authorizedOrigins.
 *
 * @example
 * // Example usage:
 * testAuth(StackExchangeReputation, { items: [{ reputation: 8 }] })
 */
async function testAuth(serviceClass, dummyResponse) {
  if (!(serviceClass.prototype instanceof BaseService)) {
    throw new TypeError(
      'Invalid serviceClass: Must be an instance of BaseService.',
    )
  }

  cleanUpNockAfterEach()

  const config = { private: { stackapps_api_key: 'fake-key' } }
  const exampleInvokeParams = getBadgeExampleCall(serviceClass)
  const authOrigin = serviceClass.auth.authorizedOrigins[0]

  if (!authOrigin) {
    throw new TypeError(`Missing authorizedOrigins for ${serviceClass.name}.`)
  }

  const scope = nock(authOrigin)
    .get(/.*/)
    .query(queryObject => queryObject.key === 'fake-key')
    .reply(200, dummyResponse)
  expect(
    await serviceClass.invoke(defaultContext, config, exampleInvokeParams),
  ).to.not.have.property('isError')

  scope.done()
}

const defaultContext = { requestFetcher: fetch }

export {
  cleanUpNockAfterEach,
  noToken,
  getBadgeExampleCall,
  testAuth,
  defaultContext,
}
