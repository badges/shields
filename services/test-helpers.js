'use strict'

const nock = require('nock')
const request = require('request')
const { promisify } = require('../core/base-service/legacy-request-handler')

function cleanUpNockAfterEach() {
  afterEach(function() {
    nock.restore()
    nock.cleanAll()
    nock.enableNetConnect()
    nock.activate()
  })
}

const sendAndCacheRequest = promisify(request)

const defaultContext = { sendAndCacheRequest }

module.exports = {
  cleanUpNockAfterEach,
  sendAndCacheRequest,
  defaultContext,
}
