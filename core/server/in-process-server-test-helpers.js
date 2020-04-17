'use strict'

const merge = require('deepmerge')
const config = require('config').util.toObject()
const portfinder = require('portfinder')
const Server = require('./server')

async function createTestServer(customConfig = {}) {
  const mergedConfig = merge(config, customConfig)
  if (!mergedConfig.public.bind.port) {
    mergedConfig.public.bind.port = await portfinder.getPortPromise()
  }
  return new Server(mergedConfig)
}

module.exports = {
  createTestServer,
}
