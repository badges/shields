'use strict'

const config = require('config').util.toObject()
const Server = require('./server')

function createTestServer({ port }) {
  const requiredInstanceMetadata = {
    env: 'shields-io',
    hostname: 's3.shields.io',
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
