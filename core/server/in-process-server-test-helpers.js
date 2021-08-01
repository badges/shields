import merge from 'deepmerge'
import config from 'config'
import portfinder from 'portfinder'
import Server from './server.js'

async function createTestServer(customConfig = {}) {
  const mergedConfig = merge(config.util.toObject(), customConfig)
  if (!mergedConfig.public.bind.port) {
    mergedConfig.public.bind.port = await portfinder.getPortPromise()
  }
  return new Server(mergedConfig)
}

export { createTestServer }
