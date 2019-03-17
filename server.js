'use strict'
/* eslint-disable import/order */

require('dotenv').config()

// Set up Sentry reporting as early in the process as possible.
const Raven = require('raven')
const serverSecrets = require('./lib/server-secrets')

Raven.config(process.env.SENTRY_DSN || serverSecrets.sentry_dsn).install()
Raven.disableConsoleAlerts()

const config = require('config').util.toObject()
if (+process.argv[2]) {
  config.public.bind.port = +process.argv[2]
}
if (process.argv[3]) {
  config.public.bind.address = process.argv[3]
}

console.log('Configuration:')
console.dir(config.public, { depth: null })

const Server = require('./core/server/server')
const server = (module.exports = new Server(config))

;(async () => {
  try {
    await server.start()
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
})()
