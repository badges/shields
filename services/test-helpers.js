import dayjs from 'dayjs'
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
 * Generates a configuration object with a fake key based on the provided class.
 * For use in auth tests where a config with a test key is required.
 *
 * @param {BaseService} serviceClass - The class to generate configuration for.
 * @param {string} fakeKey - The fake key to be used in the configuration.
 * @param {string} fakeUser - Optional, The fake user to be used in the configuration.
 * @param {string} fakeauthorizedOrigins - authorizedOrigins to add to config.
 * @returns {object} - The configuration object.
 * @throws {TypeError} - Throws an error if the input is not a class.
 */
function generateFakeConfig(
  serviceClass,
  fakeKey,
  fakeUser,
  fakeauthorizedOrigins,
) {
  if (
    !serviceClass ||
    !serviceClass.prototype ||
    !(serviceClass.prototype instanceof BaseService)
  ) {
    throw new TypeError(
      'Invalid serviceClass: Must be an instance of BaseService.',
    )
  }
  if (!fakeKey || typeof fakeKey !== 'string') {
    throw new TypeError('Invalid fakeKey: Must be a String.')
  }
  if (!fakeauthorizedOrigins || typeof fakeauthorizedOrigins !== 'string') {
    throw new TypeError('Invalid fakeauthorizedOrigins: Must be a String.')
  }

  if (!serviceClass.auth) {
    throw new Error(`Missing auth for ${serviceClass.name}.`)
  }
  if (!serviceClass.auth.passKey) {
    throw new Error(`Missing auth.passKey for ${serviceClass.name}.`)
  }
  // Extract the passKey property from auth, or use a default if not present
  const passKeyProperty = serviceClass.auth.passKey
  let passUserProperty = 'placeholder'
  if (fakeUser) {
    if (typeof fakeKey !== 'string') {
      throw new TypeError('Invalid fakeUser: Must be a String.')
    }
    if (!serviceClass.auth.userKey) {
      throw new Error(`Missing auth.userKey for ${serviceClass.name}.`)
    }
    passUserProperty = serviceClass.auth.userKey
  }

  // Build and return the configuration object with the fake key
  return {
    public: {
      services: {
        [serviceClass.auth.serviceKey]: {
          authorizedOrigins: [fakeauthorizedOrigins],
        },
      },
    },
    private: {
      [passKeyProperty]: fakeKey,
      [passUserProperty]: fakeUser,
    },
  }
}

/**
 * Returns the name of the auth method of the service class provided
 *
 * @param {BaseService} serviceClass The service class to extract auth method from.
 * @throws {TypeError} - Throws a TypeError if the input `serviceClass` is not an instance of BaseService
 *  or if the authHelper function is missing in fetch.
 * @returns {string} The auth method of the service class provided.
 *  May return on of the following strings: BasicAuth, ApiKeyHeader, BearerAuthHeader, QueryStringAuth, JwtAuth.
 *
 * @example
 * // Example usage:
 * getAuthMethod(SonarCoverage)
 * // outputs "BasicAuth"
 */
function getAuthMethod(serviceClass) {
  if (
    !serviceClass ||
    !serviceClass.prototype ||
    !(serviceClass.prototype instanceof BaseService)
  ) {
    throw new TypeError(
      `Invalid serviceClass ${serviceClass}: Must be an instance of BaseService.`,
    )
  }
  const fetchFunctionString = serviceClass.prototype.fetch.toString()
  const result = fetchFunctionString.match(
    /this\.authHelper\.with([A-Z][a-zA-Z0-9_]+)\(/,
  )
  if (result) {
    return result[1]
  } else {
    throw new TypeError(
      'Invalid serviceClass: Missing authHelper function in fetch.',
    )
  }
}

/**
 * Returns the prefix of the bearer token for a service class.
 *
 * @param {BaseService} serviceClass The service class to extract auth method from.
 * @throws {TypeError} - Throws a TypeError if the input `serviceClass` is not an instance of BaseService.
 * @returns {string} Bearer token prefix.
 *
 * @example
 * // Example usage:
 * getBearerPrefixOfService(Discord)
 * // outputs 'Bot'
 */
function getBearerPrefixOfService(serviceClass) {
  if (
    !serviceClass ||
    !serviceClass.prototype ||
    !(serviceClass.prototype instanceof BaseService)
  ) {
    throw new TypeError(
      `Invalid serviceClass ${serviceClass}: Must be an instance of BaseService.`,
    )
  }
  const fetchFunctionString = serviceClass.prototype.fetch.toString()
  const result = fetchFunctionString.match(
    /withBearerAuthHeader\([\s\S]*,\s+['"`]([\s\S]*)['"`],?\s*\)/,
  )
  if (result) {
    return result[1]
  } else {
    return 'Bearer'
  }
}

/**
 * Returns the prefix of the bearer token for a service class.
 *
 * @param {BaseService} serviceClass The service class to extract auth method from.
 * @throws {TypeError} - Throws a TypeError if the input `serviceClass` is not an instance of BaseService.
 * @returns {string} Bearer token prefix.
 *
 * @example
 * // Example usage:
 * getApiHeaderKeyOfService(CurseForgeDownloads)
 * // outputs 'x-api-key'
 */
function getApiHeaderKeyOfService(serviceClass) {
  if (
    !serviceClass ||
    !serviceClass.prototype ||
    !(serviceClass.prototype instanceof BaseService)
  ) {
    throw new TypeError(
      `Invalid serviceClass ${serviceClass}: Must be an instance of BaseService.`,
    )
  }
  const fetchFunctionString = serviceClass.prototype.fetch.toString()
  const result = fetchFunctionString.match(
    /withApiKeyHeader\([\s\S]*,\s+['"`]([\s\S]*)['"`],?\s*\)/,
  )
  if (result) {
    return result[1]
  } else {
    return 'x-api-key'
  }
}

/**
 * Returns the first auth origin found for a provided service class.
 *
 * @param {BaseService} serviceClass The service class to find the authorized origins.
 * @throws {TypeError} - Throws a TypeError if the input `serviceClass` is not an instance of BaseService.
 * @returns {string} First auth origin found.
 *
 * @example
 * // Example usage:
 * getServiceClassAuthOrigin(Obs)
 * // outputs 'https://api.opensuse.org'
 */
function getServiceClassAuthOrigin(serviceClass) {
  if (
    !serviceClass ||
    !serviceClass.prototype ||
    !(serviceClass.prototype instanceof BaseService)
  ) {
    throw new TypeError(
      `Invalid serviceClass ${serviceClass}: Must be an instance of BaseService.`,
    )
  }
  if (serviceClass.auth.authorizedOrigins) {
    return serviceClass.auth.authorizedOrigins[0]
  } else {
    return config.public.services[serviceClass.auth.serviceKey]
      .authorizedOrigins
  }
}

/**
 * Generate a fake JWT Token valid for 1 hour for use in testing.
 *
 * @returns {string} Fake JWT Token valid for 1 hour.
 */
function fakeJwtToken() {
  const fakeJwtPayload = { exp: dayjs().add(1, 'hours').unix() }
  const fakeJwtPayloadJsonString = JSON.stringify(fakeJwtPayload)
  const fakeJwtPayloadBase64 = Buffer.from(fakeJwtPayloadJsonString).toString(
    'base64',
  )
  const jwtToken = `FakeHeader.${fakeJwtPayloadBase64}.fakeSignature`
  return jwtToken
}

/**
 * Test authentication of a badge for it's first OpenAPI example using a provided dummyResponse
 *
 * @param {BaseService} serviceClass The service class tested.
 * @param {object} dummyResponse An object containing the dummy response by the server.
 * @throws {TypeError} - Throws a TypeError if the input `serviceClass` is not an instance of BaseService,
 * @param {nock.ReplyHeaders} headers - Header for the response.
 *   or if `serviceClass` is missing authorizedOrigins.
 *
 * @example
 * // Example usage:
 * testAuth(StackExchangeReputation, { items: [{ reputation: 8 }] })
 */
async function testAuth(serviceClass, dummyResponse, headers) {
  if (!(serviceClass.prototype instanceof BaseService)) {
    throw new TypeError(
      'Invalid serviceClass: Must be an instance of BaseService.',
    )
  }

  cleanUpNockAfterEach()

  const fakeUser = serviceClass.auth.userKey ? 'fake-user' : undefined
  const fakeSecret = 'fake-secret'
  const authMethod = getAuthMethod(serviceClass)
  const authOrigin = getServiceClassAuthOrigin(serviceClass)
  const config = generateFakeConfig(
    serviceClass,
    fakeSecret,
    fakeUser,
    authOrigin,
  )
  const exampleInvokeParams = getBadgeExampleCall(serviceClass)

  if (!authOrigin) {
    throw new TypeError(`Missing authorizedOrigins for ${serviceClass.name}.`)
  }

  const scope = nock(authOrigin)
  switch (authMethod) {
    case 'BasicAuth':
      scope
        .get(/.*/)
        .basicAuth({ user: fakeUser, pass: fakeSecret })
        .reply(200, dummyResponse, headers)
      break
    case 'ApiKeyHeader':
      // TODO may fail if header is not default (see auth-helper.js - withApiKeyHeader)
      scope
        .get(/.*/)
        .matchHeader(getApiHeaderKeyOfService(serviceClass), fakeSecret)
        .reply(200, dummyResponse, headers)
      break
    case 'BearerAuthHeader':
      scope
        .get(/.*/)
        .matchHeader(
          'Authorization',
          `${getBearerPrefixOfService(serviceClass)} ${fakeSecret}`,
        )
        .reply(200, dummyResponse, headers)
      break
    case 'QueryStringAuth':
      scope
        .get(/.*/)
        .query(queryObject => queryObject.key === fakeSecret)
        .reply(200, dummyResponse, headers)
      break
    case 'JwtAuth': {
      const fakeToken = fakeJwtToken()
      scope
        .post(/.*/, { username: fakeUser, password: fakeSecret })
        .reply(200, fakeToken, headers)
      scope
        .get(/.*/)
        .matchHeader('Authorization', `Bearer ${fakeToken}`)
        .reply(200, dummyResponse, headers)
      break
    }

    default:
      throw new TypeError(`Unkown auth method for ${serviceClass.name}.`)
  }

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
