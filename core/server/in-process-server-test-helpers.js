'use strict'

const config = require('config').util.toObject()
const Server = require('./server')

function createTestServer({ port }) {
  const requiredInstanceMetadata = {
    env: 'testing',
    hostname: 'localhost',
  }

  const serverConfig = {
    ...config,
    public: {
      ...config.public,
      bind: {
        ...config.public.bind,
        port,
      },
    },
  }

  return new Server(serverConfig, requiredInstanceMetadata)
}

module.exports = {
  createTestServer,
}
