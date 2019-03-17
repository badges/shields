'use strict'

const config = require('config').util.toObject()
const Server = require('./server')

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
