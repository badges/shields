'use strict'

const serverConfig = require('./server-config')
const Server = require('./server')

function createTestServer({ port }) {
  const config = {
    ...serverConfig,
    bind: {
      port,
      address: 'localhost',
    },
    ssl: {
      isSecure: false,
    },
    baseUri: `http://localhost:${port}`,
    cors: {
      allowedOrigin: [],
    },
    rateLimit: false,
  }

  return new Server(config)
}

module.exports = {
  createTestServer,
}
