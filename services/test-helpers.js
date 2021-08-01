import bytes from 'bytes'
import nock from 'nock'
import config from 'config'
import { fetchFactory } from '../core/base-service/got.js'
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
        `${serviceClass.name}: no credentials configured, tests for this service will be skipped. Add credentials in local.yml to run them.`
      )
      hasLogged = true
    }
    return noToken
  }
}

const sendAndCacheRequest = fetchFactory(bytes(runnerConfig.public.fetchLimit))

const defaultContext = { sendAndCacheRequest }

export { cleanUpNockAfterEach, noToken, sendAndCacheRequest, defaultContext }
