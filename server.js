'use strict'

const Raven = require('raven')
const serverSecrets = require('./lib/server-secrets')

Raven.config(process.env.SENTRY_DSN || serverSecrets.sentry_dsn).install()
Raven.disableConsoleAlerts()

const Server = require('./lib/server')
const config = require('./lib/server-config')

;(async () => {
  try {
    await new Server(config).start()
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
})()
