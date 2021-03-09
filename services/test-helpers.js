'use strict'

const bytes = require('bytes')
const nock = require('nock')
const runnerConfig = require('config').util.toObject()
const { fetchFactory } = require('../core/base-service/got')

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

module.exports = {
  cleanUpNockAfterEach,
  noToken,
  sendAndCacheRequest,
  defaultContext,
}
