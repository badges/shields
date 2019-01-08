'use strict'

const Server = require('./server')
const config = require('config').util.toObject()

function createTestServer({ port }) {
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

  return new Server(serverConfig)
}

module.exports = {
  createTestServer,
}
