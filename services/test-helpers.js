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

const defaultContext = { requestFetcher: fetch }

export { cleanUpNockAfterEach, noToken, getBadgeExampleCall, defaultContext }
