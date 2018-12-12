'use strict'

const serverConfig = require('./server-config')
const Server = require('./server')

function createTestServer({ port }) {
  const config = {
    ...serverConfig,
    bind: {
      port,
      address: '::',
    },
    ssl: {
      isSecure: false,
    },
    baseUri: `http://[::]:${port}`,
    cors: {
      allowedOrigin: [],
    },
  }

  return new Server(config)
}

module.exports = {
  createTestServer,
}
