'use strict'

const serverConfig = require('./server-config')
const Server = require('./server')

const redirectUrl = 'http://badge-server.example.com'

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
    redirectUrl,
  }

  return new Server(config)
}

module.exports = {
  createTestServer,
  redirectUrl,
}
