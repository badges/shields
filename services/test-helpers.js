import nock from 'nock';
import request from 'request';
const runnerConfig = require('config').util.toObject()
import {promisify} from '../core/base-service/legacy-request-handler.js';

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

const sendAndCacheRequest = promisify(request)

const defaultContext = { sendAndCacheRequest }

export {
  cleanUpNockAfterEach,
  noToken,
  sendAndCacheRequest,
  defaultContext,
};
