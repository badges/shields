'use strict'

const envFlag = require('node-env-flag')

module.exports = {
  port: 1111,
  get testedServerUrl() {
    return process.env.TESTED_SERVER_URL || `http://localhost:${this.port}`
  },
  skipIntercepted: envFlag(process.env.SKIP_INTERCEPTED, false),
}
