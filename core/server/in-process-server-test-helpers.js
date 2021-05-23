import merge from 'deepmerge';
const config = require('config').util.toObject()
import portfinder from 'portfinder';
import Server from './server.js';

async function createTestServer(customConfig = {}) {
  const mergedConfig = merge(config, customConfig)
  if (!mergedConfig.public.bind.port) {
    mergedConfig.public.bind.port = await portfinder.getPortPromise()
  }
  return new Server(mergedConfig)
}

export {
  createTestServer,
};
